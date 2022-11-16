import { EMPTY, fromEvent, Observable } from "rxjs";
import {
  catchError,
  exhaustMap,
  first,
  map,
  shareReplay,
  switchMap,
  takeLast,
  tap,
} from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { fromXMLHttpRequestDownload } from "../shared/from-xml-http-request-download";
import { clickAnchorDownload } from "../shared/click-anchor-download";
import { exactFilename } from "../shared/exact-filename";
import { percentString } from "../shared/percent-string";

{
  const containerEl = document.querySelector<HTMLElement>(
    `[data-xhr-download-stream]`
  )!;

  const downloadStreamEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-downloadStreamEl]"
  )!;

  // เดี๋ยวค่อยทำ ขี้เกียจ
  const anchorEl = document.querySelector<HTMLElement>(`[data-anchor]`)!;

  const percentEl =
    containerEl.querySelector<HTMLSpanElement>("[data-percent]")!;
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
}

{
  const containerEl =
    document.querySelector<HTMLElement>(`[data-download-pdf]`)!;

  const anchorEl = document.querySelector<HTMLElement>(`[data-anchor]`)!;

  const downloadEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-download-button]"
  )!;
  const blob$ = fromEvent(downloadEl, "click").pipe(
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
        })
      );
    }),
    shareReplay(1)
  );

  blob$
    .pipe(
      switchMap((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.innerText = "get this file";
        anchorEl.innerHTML = "";
        anchorEl.append(anchor);
        anchor.href = blobUrl;
        anchor.download = "RxJS.pdf";

        return fromEvent(anchor, "click").pipe(
          tap({
            unsubscribe: () => {
              URL.revokeObjectURL(blobUrl);
            },
          })
        );
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>(`[data-fetch-api]`)!;

  const fetchEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-fetch-button]"
  )!;
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
}

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

{
  const containerEl = document.querySelector<HTMLElement>(`[data-rxjs-ajax]`)!;
  const downloadButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-download-button]"
  )!;

  const anchorEl = containerEl.querySelector<HTMLElement>(`[data-anchor]`)!;

  const percentEl = containerEl.querySelector<HTMLElement>(`[data-percent]`)!;
  const blob$ = fromEvent(downloadButtonEl, "click").pipe(
    exhaustMap(() => {
      percentEl.innerText = `0/0`;
      return ajax<Blob>({
        url: `http://localhost:3000/pdf-packt`,
        includeDownloadProgress: true,
        responseType: "blob",
        async: true,
        timeout: 10000,
        method: "GET",
        crossDomain: true,
        headers: { "Access-Control-Allow-Origin": location.origin },
      }).pipe(
        tap((ajaxResponse) => {
          percentEl.innerText = percentString(
            ajaxResponse.loaded,
            ajaxResponse.total
          );
        }),
        first((ajaxResponse) => {
          return ajaxResponse.type === "download_load";
        }),
        map((ajaxResponse) => {
          const blob = ajaxResponse.response;
          const filename =
            exactFilename(
              ajaxResponse.responseHeaders["content-disposition"]
            ) || "RxJS.pdf";
          return [blob, filename] as const;
        }),
        catchError((err) => {
          console.error(err);
          return EMPTY;
        })
      );
    }),
    shareReplay(1)
  );

  blob$
    .pipe(
      switchMap(([blob, filename]) => {
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.innerText = filename || "get this file";
        anchorEl.innerHTML = "";
        anchorEl.append(anchor);
        anchor.href = blobUrl;
        anchor.download = filename;

        return fromEvent(anchor, "click").pipe(
          tap({
            unsubscribe: () => {
              URL.revokeObjectURL(blobUrl);
            },
          })
        );
      })
    )
    .subscribe();
}
