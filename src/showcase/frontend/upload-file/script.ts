import { EMPTY, fromEvent, Observable } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  catchError,
  exhaustMap,
  filter,
  map,
  share,
  switchMap,
  tap,
} from "rxjs/operators";

const inputSingleFileUploadEl = document.querySelector<HTMLInputElement>(
  "[data-single-file-upload]"
)!;

const singleFileUpload$ = fromUploadInput(inputSingleFileUploadEl, {
  multiple: false,
});

const buttonUploadSingleFile = document.querySelector<HTMLButtonElement>(
  "[data-button-upload-single-file]"
)!;

const selectedSingleFileContainerEl = document.querySelector<HTMLElement>(
  `[data-selected-single-file]`
)!;

const clickUploadSingleFile$ = fromEvent<PointerEvent>(
  buttonUploadSingleFile,
  "click"
);

singleFileUpload$
  .pipe(
    switchMap((file) => {
      if (file) {
        selectedSingleFileContainerEl.innerText = `${file.name}`;
        buttonUploadSingleFile.style.display = "block";
        return clickUploadSingleFile$.pipe(
          exhaustMap(() => {
            return fromFetch("/upload-single-file", {
              method: "POST",
              body: file,
              // duplex: "half",
              selector: (res) => res.json(),
            }).pipe(
              catchError((err) => {
                return EMPTY;
              }),
              tap(() => {
                inputSingleFileUploadEl.value = "";
                buttonUploadSingleFile.style.display = "none";
                selectedSingleFileContainerEl.innerHTML = ``;
              })
            );
          })
        );
      }
      return EMPTY;
    })
  )
  .subscribe();

const inputMultipleFilesUploadEl = document.querySelector<HTMLInputElement>(
  "[data-multiple-files-upload]"
)!;

const multipleFilesUpload$ = fromUploadInput(inputMultipleFilesUploadEl, {
  multiple: true,
}).pipe(share());

const selectedMultipleFilesContainerEl = document.querySelector<HTMLDivElement>(
  "[data-selected-multiple-files]"
)!;

const buttonUploadMultipleFilesEl = document.querySelector<HTMLButtonElement>(
  "[data-button-upload-multiple-files]"
)!;

multipleFilesUpload$
  .pipe(
    switchMap((fileList) => {
      const filesArray = Array.from(fileList);
      const listSelectedFilesHTML = filesArray.reduce((path, file) => {
        path += `<div>${file.name}</div>`;
        return path;
      }, "");

      selectedMultipleFilesContainerEl.innerHTML = `${listSelectedFilesHTML}`;
      if (fileList.length > 0) {
        buttonUploadMultipleFilesEl.style.display = "block";
        return fromEvent(buttonUploadMultipleFilesEl, "click").pipe(
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
              catchError((err) => {
                return EMPTY;
              }),
              tap(() => {
                inputMultipleFilesUploadEl.value = "";
                selectedMultipleFilesContainerEl.innerHTML = "";
                buttonUploadMultipleFilesEl.style.display = "none";
              })
            );
          })
        );
      }
      return EMPTY;
    })
  )
  .subscribe();

const singleFileProgressUploadEl = document.querySelector<HTMLInputElement>(
  "[data-single-file-progress-upload]"
)!;

const singleFileProgressUpload$ = fromUploadInput(singleFileProgressUploadEl, {
  multiple: false,
});

function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: false }
): Observable<File>;
function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: true }
): Observable<FileList>;
function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: boolean }
) {
  return fromEvent(element, "change").pipe(
    filter(() => {
      return element.files!.length > 0;
    }),
    map(() => {
      if (mode.multiple) {
        return element.files!;
      }
      return element.files![0];
    })
  );
}
