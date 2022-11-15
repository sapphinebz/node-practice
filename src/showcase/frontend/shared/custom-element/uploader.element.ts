import {
  AsyncSubject,
  EMPTY,
  fromEvent,
  merge,
  Observable,
  of,
  Subject,
} from "rxjs";
import {} from "rxjs/fetch";
import {
  distinctUntilChanged,
  exhaustMap,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import { fromUploadInput } from "../from-upload-input";

export class UploaderElement extends HTMLElement {
  includedFilename = true;
  uploadMultipleFiles = false;
  imageOnly = false;
  onDestroy$ = new AsyncSubject<void>();
  onUploaded$ = new Subject<void>();

  // input
  uploadFactory?: (file: File, filename?: string) => Observable<any>;
  uploadMultipleFilesFactory?: (file: FileList) => Observable<any>;

  containerEl!: HTMLElement;
  fileNameContainerEl!: HTMLElement;
  inputFileEl!: HTMLInputElement;
  inputFileNameEl!: HTMLInputElement;
  onSelectedUploadSingleFile$!: Observable<File>;
  onSelectedUploadMultipleFiles$!: Observable<FileList>;
  fileName$!: Observable<string>;
  buttonUploadEl!: HTMLButtonElement;
  filesSelectedEl!: HTMLElement;

  onClickUpload$!: Observable<PointerEvent>;

  constructor() {
    super();
    this.innerHTML = `
    <div data-container style="
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    ">
      <input data-upload type="file" />
      <div data-files-selected style="display:none"></div>
      <div style="display: none" data-file-name-container>
        file name:
        <input type="text" data-file-name />
      </div>
      <div>
        <button style="display: none" data-button-upload>upload</button>
      </div>
    </div>
    `;

    this.containerEl = this.querySelector<HTMLElement>("[data-container]")!;
    this.fileNameContainerEl = this.containerEl.querySelector<HTMLDivElement>(
      "[data-file-name-container]"
    )!;
    this.inputFileEl =
      this.containerEl.querySelector<HTMLInputElement>("[data-upload]")!;

    this.inputFileNameEl =
      this.containerEl.querySelector<HTMLInputElement>("[data-file-name]")!;
    this.fileName$ = fromEvent(this.inputFileNameEl, "input").pipe(
      map(() => this.inputFileNameEl.value),
      startWith(this.inputFileNameEl.value),
      shareReplay(1)
    );

    this.buttonUploadEl = this.containerEl.querySelector<HTMLButtonElement>(
      "[data-button-upload]"
    )!;

    this.onClickUpload$ = fromEvent<PointerEvent>(this.buttonUploadEl, "click");
    this.filesSelectedEl = this.containerEl.querySelector<HTMLElement>(
      "[data-files-selected]"
    )!;

    this.includedFilename = this.getAttribute("include-filename") === "true";
    this.uploadMultipleFiles = this.getAttribute("mutilple-files") === "true";
    this.imageOnly = this.getAttribute("image-only") === "true";

    if (this.uploadMultipleFiles) {
      this.includedFilename = false;
      this.filesSelectedEl.style.display = "block";

      this.inputFileEl.setAttribute("multiple", "");

      this.onSelectedUploadMultipleFiles$ = fromUploadInput(this.inputFileEl, {
        multiple: true,
      }).pipe(share());

      this.onSelectedUploadSingleFile$ = EMPTY;
    } else {
      this.onSelectedUploadSingleFile$ = fromUploadInput(this.inputFileEl, {
        multiple: false,
      }).pipe(share());

      this.onSelectedUploadMultipleFiles$ = EMPTY;
    }

    if (this.imageOnly) {
      this.inputFileEl.setAttribute(
        "accept",
        "image/png, image/gif, image/jpeg, image/x-png"
      );
    }
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === "included-filename") {
      this.includedFilename = `${newValue}` === "true";
    }
  }

  static get observedAttributes() {
    return ["include-filename"];
  }

  connectedCallback() {
    const validation$ = this.includedFilename
      ? this.fileName$.pipe(
          map((name) => {
            if (name) {
              return true;
            } else {
              return false;
            }
          }),
          distinctUntilChanged(),
          shareReplay(1)
        )
      : of(true);

    validation$.pipe(takeUntil(this.onDestroy$)).subscribe((valid) => {
      if (valid) {
        this.buttonUploadEl.removeAttribute("disabled");
      } else {
        this.buttonUploadEl.setAttribute("disabled", "");
      }
    });

    if (this.uploadMultipleFiles) {
      this.onSelectedUploadMultipleFiles$
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((fileList) => {
          const filesArray = Array.from(fileList);
          const listSelectedFilesHTML = filesArray.reduce((path, file) => {
            path += `<div>${file.name}</div>`;
            return path;
          }, "");
          this.filesSelectedEl.innerHTML = listSelectedFilesHTML;
        });

      this.onUploaded$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
        this.filesSelectedEl.innerHTML = "";
      });
    }

    if (this.includedFilename) {
      this.onSelectedUploadSingleFile$
        .pipe(takeUntil(this.onDestroy$))
        .subscribe((file) => {
          const isSelectedFile =
            file instanceof FileList ? file.length > 0 : Boolean(file);
          if (isSelectedFile) {
            this.fileNameContainerEl.style.display = "block";
          } else {
            this.fileNameContainerEl.style.display = "none";
          }
        });

      this.onUploaded$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
        this.fileNameContainerEl.style.display = "none";
        this.inputFileNameEl.value = "";
      });
    } else {
      this.fileNameContainerEl.style.display = "none";
    }

    const onSelectedUploadFile$ = merge(
      this.onSelectedUploadSingleFile$,
      this.onSelectedUploadMultipleFiles$
    ).pipe(share());

    onSelectedUploadFile$.pipe(takeUntil(this.onDestroy$)).subscribe((file) => {
      if (file) {
        this.buttonUploadEl.style.display = "unset";
      } else {
        this.buttonUploadEl.style.display = "none";
      }
    });

    this.onUploaded$.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      this.inputFileEl.value = "";
      this.buttonUploadEl.style.display = "none";
    });

    onSelectedUploadFile$
      .pipe(
        switchMap((file) => {
          if (file) {
            return this.onClickUpload$.pipe(
              exhaustMap(() => {
                if (file instanceof File && this.uploadFactory) {
                  const filename = this.inputFileNameEl?.value ?? "";
                  return this.uploadFactory(file, filename);
                } else if (
                  file instanceof FileList &&
                  this.uploadMultipleFilesFactory
                ) {
                  return this.uploadMultipleFilesFactory(file);
                }

                console.error("uploadFactory is required for uploader element");
                return EMPTY;
              })
            );
          }
          return EMPTY;
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  nextUpload() {
    this.onUploaded$.next();
  }

  disconnectedCallback() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

customElements.define("uploader-element", UploaderElement);
