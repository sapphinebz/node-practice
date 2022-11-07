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
            return XMLHttpRequestUpload(
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

function XMLHttpRequestUpload(url: string, formData: FormData) {
  return new Observable<number>((subscriber) => {
    let request = new XMLHttpRequest();
    request.open("POST", url);
    // request.setRequestHeader(
    //   "Content-Type",
    //   "application/x-www-form-urlencoded"
    // );
    // request.setRequestHeader("Content-Type", "multipart/form-data");

    // upload progress event
    const progressHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total) * 100;
      console.log(percent_completed);
      subscriber.next(percent_completed);
    };
    request.upload.addEventListener("progress", progressHandler);

    const uploadCompleteHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.complete();
    };

    request.upload.addEventListener("load", uploadCompleteHandler);

    const uploadErrorHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.error(event);
    };
    request.upload.addEventListener("error", uploadErrorHandler);

    const uploadTimeoutHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.error(new Error("timeout"));
    };
    request.upload.addEventListener("timeout", uploadTimeoutHandler);

    // request finished event
    const loadHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
      // HTTP status message (200, 404 etc)
      console.log(request.status);

      // request.response holds response from the server
      console.log(request.response);
    };
    request.addEventListener("load", loadHandler);

    // send POST request to server
    request.send(formData);

    return {
      unsubscribe: () => {
        request.upload.removeEventListener("progress", progressHandler);
        request.upload.removeEventListener("load", uploadCompleteHandler);
        request.upload.removeEventListener("error", uploadErrorHandler);
        request.upload.removeEventListener("timeout", uploadTimeoutHandler);
        request.removeEventListener("load", loadHandler);
      },
    };
  });
}

// application/x-www-form-urlencoded
// application/json
// multipart/form-data
