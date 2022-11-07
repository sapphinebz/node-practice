import { EMPTY, fromEvent, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, exhaustMap, switchMap, tap } from "rxjs/operators";

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
