import { EMPTY, fromEvent, Subject } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  share,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs/operators";
import { fromUploadInput } from "../shared/from-upload-input";
import { fromXMLHttpRequestUpload } from "../shared/from-xml-http-request-upload";
{
  const containerEl = document.querySelector<HTMLElement>(
    "[data-single-file-attached-body]"
  )!;

  const inputFileEl =
    containerEl.querySelector<HTMLInputElement>("[data-input-file]")!;

  const onSelectedUploadFile$ = fromUploadInput(inputFileEl, {
    multiple: false,
  });

  const uploadButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-upload-button]"
  )!;

  const selectedContainerEl =
    containerEl.querySelector<HTMLElement>(`[data-selected]`)!;

  const onClickUpload$ = fromEvent<PointerEvent>(uploadButtonEl, "click");

  const onUploaded$ = new Subject<void>();
  onUploaded$.subscribe(() => {
    inputFileEl.value = "";
    uploadButtonEl.style.display = "none";
    selectedContainerEl.innerHTML = ``;
  });

  onSelectedUploadFile$
    .pipe(
      switchMap((file) => {
        if (file) {
          selectedContainerEl.innerText = `${file.name}`;
          uploadButtonEl.style.display = "block";
          return onClickUpload$.pipe(
            exhaustMap(() => {
              return fromFetch("/upload-single-file", {
                method: "POST",
                body: file,
                // duplex: "half",
                selector: (res) => res.json(),
              }).pipe(
                tap(() => {
                  onUploaded$.next();
                }),
                catchError((err) => {
                  return EMPTY;
                })
              );
            })
          );
        }
        return EMPTY;
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>(
    "[data-multiple-files-upload]"
  )!;

  const inputFileEl =
    containerEl.querySelector<HTMLInputElement>("[data-input-file]")!;

  const onSelectedUploadFiles$ = fromUploadInput(inputFileEl, {
    multiple: true,
  }).pipe(share());

  const selectedContainerEl =
    containerEl.querySelector<HTMLDivElement>("[data-selected]")!;

  const uploadButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-button-upload]"
  )!;

  const onUploaded$ = new Subject<void>();

  onUploaded$.subscribe(() => {
    inputFileEl.value = "";
    selectedContainerEl.innerHTML = "";
    uploadButtonEl.style.display = "none";
  });

  onSelectedUploadFiles$
    .pipe(
      switchMap((fileList) => {
        const filesArray = Array.from(fileList);
        const listSelectedFilesHTML = filesArray.reduce((path, file) => {
          path += `<div>${file.name}</div>`;
          return path;
        }, "");

        selectedContainerEl.innerHTML = `${listSelectedFilesHTML}`;
        if (fileList.length > 0) {
          uploadButtonEl.style.display = "block";
          return fromEvent(uploadButtonEl, "click").pipe(
            exhaustMap(() => {
              const formData = new FormData();
              filesArray.forEach((file) => {
                formData.append("files", file);
              });

              return fromFetch("/upload-multiple-files", {
                method: "POST",
                body: formData,
                // headers: {
                //   "Content-Type": "multipart/form-data",
                // },
              }).pipe(
                tap(() => {
                  onUploaded$.next();
                }),
                catchError((err) => {
                  return EMPTY;
                })
              );
            })
          );
        }
        return EMPTY;
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>(
    "[data-single-file-progress]"
  )!;
  const inputFileEl =
    containerEl.querySelector<HTMLInputElement>("[data-upload]")!;

  const onSelectedUploadFile$ = fromUploadInput(inputFileEl, {
    multiple: false,
  }).pipe(share());

  const buttonUploadEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-button-upload]"
  )!;

  const fileNameContainerEl = containerEl.querySelector<HTMLDivElement>(
    "[data-file-name-container]"
  )!;

  const inputFileNameEl =
    containerEl.querySelector<HTMLInputElement>("[data-file-name]")!;

  const fileName$ = fromEvent(inputFileNameEl, "input").pipe(
    map(() => inputFileNameEl.value),
    startWith(inputFileNameEl.value),
    shareReplay(1)
  );

  const validation$ = fileName$.pipe(
    map((name) => {
      if (name) {
        return true;
      } else {
        return false;
      }
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  validation$.subscribe((valid) => {
    if (valid) {
      buttonUploadEl.removeAttribute("disabled");
    } else {
      buttonUploadEl.setAttribute("disabled", "");
    }
  });

  const onClickUpload$ = fromEvent<PointerEvent>(buttonUploadEl, "click");

  onSelectedUploadFile$.subscribe((file) => {
    if (file) {
      fileNameContainerEl.style.display = "block";
      buttonUploadEl.style.display = "unset";
    } else {
      fileNameContainerEl.style.display = "none";
      buttonUploadEl.style.display = "none";
    }
  });

  const onUploaded$ = new Subject<void>();
  onUploaded$.subscribe(() => {
    inputFileEl.value = "";
    fileNameContainerEl.style.display = "none";
    inputFileNameEl.value = "";
    buttonUploadEl.style.display = "none";
  });

  onSelectedUploadFile$
    .pipe(
      switchMap((file) => {
        if (file) {
          return onClickUpload$.pipe(
            exhaustMap(() => {
              const fileName = inputFileNameEl.value;
              const formData = new FormData();
              formData.set("file", file);
              formData.set("fileName", fileName);
              return fromXMLHttpRequestUpload(
                "/upload-single-file-progress",
                formData
              ).pipe(
                tap(() => {
                  onUploaded$.next();
                }),
                catchError((err) => {
                  return EMPTY;
                })
              );
            })
          );
        }
        return EMPTY;
      })
    )
    .subscribe();
}

// application/x-www-form-urlencoded
// application/json
// multipart/form-data
