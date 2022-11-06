import { EMPTY, fromEvent } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, switchMap, tap } from "rxjs/operators";

const uploadFilesEl = document.querySelector<HTMLInputElement>(
  "[data-upload-files]"
)!;
const selectedEl = document.querySelector("[data-selected]")!;
const uploadButtonEl = document.querySelector<HTMLDivElement>(
  "[data-upload-button]"
)!;
fromEvent(uploadFilesEl, "change")
  .pipe(
    switchMap((event) => {
      const files = uploadFilesEl.files!;
      const filesArray = Array.from(files);
      const selectedName = filesArray.reduce((path, file) => {
        path += `<div>${file.name}</div>`;
        return path;
      }, "");
      selectedEl.innerHTML = `${selectedName}`;
      if (files.length > 0) {
        uploadButtonEl.style.display = "block";
        return fromEvent(uploadButtonEl, "click").pipe(
          switchMap(() => {
            const formData = new FormData();
            filesArray.forEach((file) => {
              formData.append("files", file);
            });

            return fromFetch("/upload", {
              method: "POST",
              body: formData,
              // headers: {
              //   "Content-Type": "multipart/form-data",
              // },
            }).pipe(
              tap(() => {
                uploadFilesEl.value = "";
                selectedEl.innerHTML = "";
                uploadButtonEl.style.display = "none";
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
  .subscribe(console.log);
