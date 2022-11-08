import { EMPTY, fromEvent, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  catchError,
  exhaustMap,
  switchMap,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { fromUploadInput } from "../shared/from-upload-input";

const httpGetEl = document.querySelector<HTMLElement>("[data-http-get]")!;

const fetchBtnEl =
  httpGetEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;
const contentEl = httpGetEl.querySelector<HTMLDivElement>("[data-content]")!;

fromEvent(fetchBtnEl, "click")
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

const httpPostEl = document.querySelector<HTMLElement>("[data-http-post]")!;
const httpPostFetchBtnEl =
  httpPostEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

const httpPostStatusEl =
  httpPostEl.querySelector<HTMLElement>("[data-status]")!;

fromEvent(httpPostFetchBtnEl, "click")
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
          httpPostStatusEl.innerHTML = `${JSON.stringify(response)}`;
        })
      );
    })
  )
  .subscribe();

const httpPostFormDataEl = document.querySelector<HTMLElement>(
  "[data-http-post-form-data]"
)!;

const httpPostFetchFormDataBtnEl =
  httpPostFormDataEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

const httpPostStatusFormDataEl =
  httpPostFormDataEl.querySelector<HTMLElement>("[data-status]")!;

const httpPostFetchFormDataFileEl =
  httpPostFormDataEl.querySelector<HTMLInputElement>("[data-file]")!;

const file$ = fromUploadInput(httpPostFetchFormDataFileEl, { multiple: false });

fromEvent(httpPostFetchFormDataBtnEl, "click")
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
          httpPostStatusFormDataEl.innerHTML = `${JSON.stringify(response)}`;
        })
      );
    })
  )
  .subscribe();
