import { EMPTY, fromEvent } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, exhaustMap, share, switchMap, tap } from "rxjs/operators";
import { fromUploadInput } from "../shared/from-upload-input";
import { fromXMLHttpRequestUpload } from "../shared/from-xml-http-request-upload";

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
  "[data-single-file-progress] [data-upload]"
)!;

const singleFileProgressUpload$ = fromUploadInput(singleFileProgressUploadEl, {
  multiple: false,
}).pipe(share());

const buttonUploadSingleFileProgressEl =
  document.querySelector<HTMLButtonElement>(
    "[data-single-file-progress] [data-button-upload]"
  )!;

const dataFileNameContainerSingleFileProgressUploadEl =
  document.querySelector<HTMLDivElement>(
    "[data-single-file-progress] [data-file-name-container]"
  )!;

const clickUploadSingleFileProgress$ = fromEvent<PointerEvent>(
  buttonUploadSingleFileProgressEl,
  "click"
);

const fileNameSingleFileProgressUploadEl =
  document.querySelector<HTMLInputElement>(
    "[data-single-file-progress] [data-file-name]"
  )!;

singleFileProgressUpload$.subscribe((file) => {
  if (file) {
    dataFileNameContainerSingleFileProgressUploadEl.style.display = "block";
    buttonUploadSingleFileProgressEl.style.display = "unset";
  } else {
    dataFileNameContainerSingleFileProgressUploadEl.style.display = "none";
    buttonUploadSingleFileProgressEl.style.display = "none";
  }
});

singleFileProgressUpload$
  .pipe(
    switchMap((file) => {
      if (file) {
        return clickUploadSingleFileProgress$.pipe(
          exhaustMap(() => {
            const fileName = fileNameSingleFileProgressUploadEl.value;
            const formData = new FormData();
            formData.set("file", file);
            formData.set("fileName", fileName);
            return fromXMLHttpRequestUpload(
              "/upload-single-file-progress",
              formData
            );
          })
        );
      }
      return EMPTY;
    })
  )
  .subscribe();

// application/x-www-form-urlencoded
// application/json
// multipart/form-data
