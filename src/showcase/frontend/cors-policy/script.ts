import { EMPTY, fromEvent, of, ReplaySubject, Subject } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  catchError,
  exhaustMap,
  map,
  mergeWith,
  share,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { fromFileToURL } from "../shared/from-file-to-url";
import { fromUploadInput } from "../shared/from-upload-input";

{
  const containerEl = document.querySelector<HTMLElement>("[data-http-get]")!;

  const fetchButtonEl =
    containerEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

  const contentEl =
    containerEl.querySelector<HTMLDivElement>("[data-content]")!;

  fromEvent(fetchButtonEl, "click")
    .pipe(
      switchMap(() => {
        return fromFetch("http://localhost:3000/api", {
          method: "GET",

          headers: {
            "Access-Control-Allow-Origin": "http://localhost:4200",
          },
          // credentials: "include",
          selector: (res) => res.json(),
        }).pipe(
          catchError((err) => {
            alert(err);
            return EMPTY;
          }),
          tap(({ results }) => {
            contentEl.innerHTML = ``;
            for (const result of results) {
              const div = document.createElement("div");
              div.innerText = JSON.stringify(result);
              contentEl.appendChild(div);
            }
          })
        );
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>("[data-http-post]")!;
  const fetchButtonEl =
    containerEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

  const statusEl = containerEl.querySelector<HTMLElement>("[data-status]")!;

  fromEvent(fetchButtonEl, "click")
    .pipe(
      exhaustMap(() => {
        return fromFetch("http://localhost:3000/api", {
          method: "POST",
          body: JSON.stringify({ queryId: 1042, name: "Thanadit" }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:4200",
          },
          // credentials: "include",
          selector: (res) => res.json(),
        }).pipe(
          catchError((err) => {
            return of(err);
          }),
          tap((response) => {
            statusEl.innerHTML = `${JSON.stringify(response)}`;
          })
        );
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>(
    "[data-http-post-form-data]"
  )!;

  const fetchButtonEl =
    containerEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

  const statusEl = containerEl.querySelector<HTMLElement>("[data-status]")!;

  const fileEl = containerEl.querySelector<HTMLInputElement>("[data-file]")!;

  const fileContainerEl = containerEl.querySelector<HTMLInputElement>(
    "[data-file-container]"
  )!;

  const file$ = fromUploadInput(fileEl, {
    multiple: false,
  }).pipe(
    share({
      connector: () => new ReplaySubject(1),
    })
  );

  let image: HTMLImageElement;

  const onUploaded$ = new Subject<void>();

  onUploaded$.subscribe(() => {
    fileEl.value = "";
  });

  file$
    .pipe(
      mergeWith(onUploaded$.pipe(map(() => null))),
      switchMap((file) => {
        if (image) {
          image.remove();
        }
        if (file && isImage(file)) {
          return fromFileToURL(file).pipe(
            tap({
              next: (url) => {
                image = document.createElement("img");
                image.src = url;
                image.style.width = "150px";
                fileContainerEl.insertAdjacentElement("afterend", image);
              },
            })
          );
        } else if (file && isPdf(file)) {
          image = document.createElement("img");
          image.src = "/assets/images/pdf-icon.png";
          image.style.width = "150px";
          fileContainerEl.insertAdjacentElement("afterend", image);
        }
        return EMPTY;
      })
    )
    .subscribe();

  fromEvent(fetchButtonEl, "click")
    .pipe(
      withLatestFrom(file$),
      exhaustMap(([_, file]) => {
        const index = file.name.lastIndexOf(".");
        const ext = file.name.slice(index);

        const formData = new FormData();
        formData.set("filename", "filename_value");
        formData.set("file", "file_value");
        formData.set("example", "example_value");
        formData.set("example1", "example_value1");
        formData.set("original", file, `Jungle${ext}`);
        return fromFetch("http://localhost:3000/api-form-data", {
          method: "POST",
          body: formData,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:4200",
          },
          // credentials: "include",
          selector: (res) => res.json(),
        }).pipe(
          catchError((err) => {
            return of(err);
          }),
          tap((response) => {
            onUploaded$.next();
            // statusEl.innerHTML = `${JSON.stringify(response)}`;
            statusEl.innerHTML = `uploaded successfully!`;
          })
        );
      })
    )
    .subscribe();
}

function isImage(file: File) {
  const index = file.name.lastIndexOf(".");
  const ext = file.name.slice(index);
  return [".jpeg", ".png", ".jpg"].includes(ext);
}

function isPdf(file: File) {
  const index = file.name.lastIndexOf(".");
  const ext = file.name.slice(index);
  return [".pdf"].includes(ext);
}
