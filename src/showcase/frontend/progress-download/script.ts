import { EMPTY, fromEvent, Observable } from "rxjs";
import { catchError, exhaustMap, takeLast, tap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { fromXMLHttpRequestDownload } from "../shared/from-xml-http-request-download";
import { clickAnchorDownload } from "../shared/click-anchor-download";

const downloadStreamEl = document.querySelector<HTMLButtonElement>(
  "[data-downloadStreamEl]"
)!;

const percentEl = document.querySelector<HTMLSpanElement>("[data-percent]")!;
fromEvent(downloadStreamEl, "click")
  .pipe(
    exhaustMap(() => {
      percentEl.innerText = `pending...`;
      return fromXMLHttpRequestDownload(`http://localhost:3000/pdf`).pipe(
        catchError((err) => {
          alert(err);
          return EMPTY;
        }),
        tap((res) => {
          percentEl.innerText = `${res.percent}%`;
        }),
        takeLast(1),
        tap((res) => {
          clickAnchorDownload(res.data!, "rxjs.pdf");
        })
      );
    })
  )
  .subscribe();

const downloadEl =
  document.querySelector<HTMLButtonElement>("[data-downloadEl]")!;
fromEvent(downloadEl, "click")
  .pipe(
    exhaustMap(() => {
      return fromFetch(`http://localhost:3000/pdf`, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": location.origin,
        },
        selector: (res) => res.blob(),
      }).pipe(
        catchError((err) => {
          alert(err);
          return EMPTY;
        }),
        tap((blob) => {
          clickAnchorDownload(blob, "rxjs.pdf");
        })
      );
    })
  )
  .subscribe();

const fetchEl = document.querySelector<HTMLButtonElement>("[data-fetchEl]")!;
fromEvent<PointerEvent>(fetchEl, "click")
  .pipe(
    exhaustMap(() => {
      return fromFetch(`http://localhost:3000/data`, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": location.origin,
        },
        selector: (res) => res.json(),
      }).pipe(
        catchError((err) => {
          alert(err);
          return EMPTY;
        })
      );
    })
  )
  .subscribe(({ results }) => {
    const contentEl = document.querySelector<HTMLElement>("[data-content]")!;
    contentEl.innerHTML = ``;
    for (const result of results) {
      const div = document.createElement("div");
      div.innerText = JSON.stringify(result);
      contentEl.appendChild(div);
    }
  });

{
  const containerEl = document.querySelector<HTMLElement>(
    `[data-download-express]`
  )!;
  const downloadEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-download-button]"
  )!;

  fromEvent<PointerEvent>(downloadEl, "click")
    .pipe(
      exhaustMap(() =>
        fromFetch(`http://localhost:3000/package`, {
          headers: {
            "Access-Control-Allow-Origin": location.origin,
          },
          selector: (resp) => resp.blob(),
        }).pipe(
          tap((blob) => {
            clickAnchorDownload(blob, "package.json");
          })
        )
      )
    )
    .subscribe();
}
