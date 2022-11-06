import { EMPTY, fromEvent } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { catchError, switchMap, tap } from "rxjs/operators";

const fetchBtnEl =
  document.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;
const contentEl = document.querySelector<HTMLDivElement>("[data-content]")!;

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
