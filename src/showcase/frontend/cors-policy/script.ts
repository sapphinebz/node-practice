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
import { generateMillsec } from "../../../time/generate-millisec";

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
            "Access-Control-Allow-Origin": location.origin,
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
            "Access-Control-Allow-Origin": location.origin,
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
    "[data-form-data-no-file]"
  )!;

  const fetchButtonEl =
    containerEl.querySelector<HTMLButtonElement>("[data-fetch-btn]")!;

  const statusEl = containerEl.querySelector<HTMLElement>("[data-status]")!;

  /**
   * ส่ง body เป็น formData เดี๋ยวมันใส่ headers Content-Type ให้อัตโนมัติเอง
   */
  fromEvent<PointerEvent>(fetchButtonEl, "click")
    .pipe(
      exhaustMap(() => {
        console.log("click");
        const formData = new FormData();
        formData.set("filename", "filename_value");
        formData.set("file", "file_value");
        formData.set("example", "example_value");
        formData.set("example1", "example_value1");
        return fromFetch("http://localhost:3000/form-data-no-file", {
          method: "POST",
          body: formData,
          headers: {
            "Access-Control-Allow-Origin": location.origin,
          },
          selector: (res) => res.json(),
        }).pipe(
          catchError((err) => {
            console.log("errr", err);
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
            "Access-Control-Allow-Origin": location.origin,
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

{
  const containerEl = document.querySelector<HTMLElement>(
    "[data-access-control-expose-headers]"
  )!;

  const fetchButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-fetch-button]"
  )!;

  fromEvent<PointerEvent>(fetchButtonEl, "click")
    .pipe(
      switchMap(() => {
        return fromFetch("http://localhost:3000/expose-headers", {
          method: "GET",
          headers: {
            "Access-Control-Allow-Origin": location.origin,
          },
          selector: (response) => {
            console.log(response.headers);
            return response.json();
          },
        }).pipe(
          catchError((err) => {
            return of(err);
          })
        );
      })
    )
    .subscribe();
}

{
  const containerEl = document.querySelector<HTMLElement>("[data-cookies]")!;

  const fetchButtonEl = containerEl.querySelector<HTMLButtonElement>(
    "[data-fetch-button]"
  )!;

  const setCookiesButtonEl =
    containerEl.querySelector<HTMLButtonElement>("[data-set-cookies]")!;

  fromEvent<PointerEvent>(fetchButtonEl, "click")
    .pipe(
      switchMap(() => {
        return fromFetch("http://localhost:3000/fetch-cookies", {
          method: "GET",
          // credentials = cookies, Authorization header
          credentials: "include",
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": location.origin,
          },
          selector: (response) => {
            return response.json();
          },
        }).pipe(
          catchError((err) => {
            return of(err);
          })
        );
      })
    )
    .subscribe();

  fromEvent<PointerEvent>(setCookiesButtonEl, "click").subscribe(() => {
    let key = "score";
    let value = encodeURIComponent(
      Math.floor(Math.random() * 123456 + 123456).toString()
    );

    const ages = generateMillsec({ days: 30 });
    document.cookie = `${key}=${value};path=/;max-age=${ages};SameSite=Strict`;
  });
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
