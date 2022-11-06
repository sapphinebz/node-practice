import { EMPTY, fromEvent, Observable } from "rxjs";
import { catchError, exhaustMap, takeLast, tap } from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";

const downloadStreamEl = document.querySelector<HTMLButtonElement>(
  "[data-downloadStreamEl]"
)!;

const percentEl = document.querySelector<HTMLSpanElement>("[data-percent]")!;
fromEvent(downloadStreamEl, "click")
  .pipe(
    exhaustMap(() => {
      percentEl.innerText = `pending...`;
      return XMLHttpRequestProgressDownload(`http://localhost:3000/pdf`).pipe(
        catchError((err) => {
          alert(err);
          return EMPTY;
        }),
        tap((res) => {
          percentEl.innerText = `${res.percent}%`;
        }),
        takeLast(1),
        tap((res) => {
          const blob = new Blob([res.data], {
            type: "application/pdf",
          });
          clickAnchorWithBlob(blob, "rxjs.pdf");
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
          "Access-Control-Allow-Origin": "http://localhost:4200/",
        },
        selector: (res) => res.blob(),
      }).pipe(
        catchError((err) => {
          alert(err);
          return EMPTY;
        }),
        tap((blob) => {
          clickAnchorWithBlob(blob, "rxjs.pdf");
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
          "Access-Control-Allow-Origin": "http://localhost:4200/",
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

function XMLHttpRequestProgressDownload(url: string) {
  return new Observable<{ data: any; percent: number }>((subscriber) => {
    let xhr = new XMLHttpRequest();
    let progress = { data: null, percent: 0 };

    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.setRequestHeader(
      "Access-Control-Allow-Origin",
      "http://localhost:4200/"
    );

    xhr.onprogress = (event) => {
      progress = {
        ...progress,
        percent: (event.loaded / event.total) * 100,
      };
      subscriber.next(progress);
    };

    xhr.onload = () => {
      if (xhr.status != 200) {
        subscriber.error({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } else {
        subscriber.next({ ...progress, data: xhr.response });
        subscriber.complete();
      }
    };

    xhr.send();

    return {
      unsubscribe: () => {
        xhr.abort();
      },
    };
  });
}

function clickAnchorWithBlob(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  document.body.append(anchor);
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(blobUrl);
}
