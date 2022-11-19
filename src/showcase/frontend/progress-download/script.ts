import { EMPTY, fromEvent, Observable } from "rxjs";
import {
  catchError,
  exhaustMap,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeLast,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { fromXMLHttpRequestDownload } from "../shared/from-xml-http-request-download";
import { clickAnchorDownload } from "../shared/click-anchor-download";
import { exactFilename } from "../shared/exact-filename";
import { percentString } from "../shared/percent-string";
import { createDownloadAnchor } from "../shared/create-download-anchor";

{
  const containerEl = document.querySelector<HTMLElement>(
    `[data-xhr-download-stream]`
  )!;

  const downloadStreamEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-downloadStreamEl]"
  )!;

  const anchorContainerEl =
    containerEl.querySelector<HTMLElement>(`[data-anchor]`)!;

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
          switchMap((res) => {
            const [anchorEl, onClickDownload$] = createDownloadAnchor(
              res.data!,
              "RxJS-online.pdf",
              "RxJS-online.pdf"
            );

            anchorContainerEl.innerHTML = "";
            anchorContainerEl.append(anchorEl);

            return onClickDownload$;
          })
        );
      })
    )
    .subscribe();
}

{
  const containerEl =
    document.querySelector<HTMLElement>(`[data-download-pdf]`)!;

  const anchorContainerEl =
    document.querySelector<HTMLElement>(`[data-anchor]`)!;

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
        const [anchorEl, onClickDownload$] = createDownloadAnchor(
          blob,
          "RxJS.pdf"
        );
        anchorContainerEl.innerHTML = "";
        anchorContainerEl.append(anchorEl);

        return onClickDownload$;
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

  const anchorContainerEl =
    containerEl.querySelector<HTMLElement>(`[data-anchor]`)!;

  fromEvent<PointerEvent>(downloadEl, "click")
    .pipe(
      exhaustMap(() =>
        fromFetch(`http://localhost:3000/package`, {
          headers: {
            "Access-Control-Allow-Origin": location.origin,
          },
          selector: (resp) => resp.blob(),
        }).pipe(
          switchMap((blob) => {
            const [anchorEl, onClickDownload$] = createDownloadAnchor(
              blob,
              "package.json",
              "package.json"
            );

            anchorContainerEl.innerHTML = "";
            anchorContainerEl.append(anchorEl);

            return onClickDownload$;
          })
        )
      )
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>(`[data-rxjs-ajax]`)!;
  const fileSizeEl = document.querySelector<HTMLElement>(`[data-file-size]`)!;
  const downloadButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-download-button]"
  )!;

  const anchorContainerEl =
    containerEl.querySelector<HTMLElement>(`[data-anchor]`)!;

  const percentEl = containerEl.querySelector<HTMLElement>(`[data-percent]`)!;

  const total$ = ajax<any>({
    url: `http://localhost:3000/pdf-packt`,
    method: "HEAD",
    responseType: "blob",
    crossDomain: true,
  }).pipe(
    map((ajaxRes) => ajaxRes.total),
    startWith(0)
  );

  total$.subscribe((total) => {
    fileSizeEl.innerText = `file size: ${total} bytes`;
  });

  const blob$ = fromEvent(downloadButtonEl, "click").pipe(
    exhaustMap(() => {
      percentEl.innerText = ``;
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
          percentEl.innerText = `progress: ${percentString(
            ajaxResponse.loaded,
            ajaxResponse.total
          )}`;
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
        const [anchorEl, onClickDownload$] = createDownloadAnchor(
          blob,
          "RxJS.pdf",
          filename
        );

        anchorContainerEl.innerHTML = "";
        anchorContainerEl.append(anchorEl);

        return onClickDownload$;
      })
    )
    .subscribe();
}
