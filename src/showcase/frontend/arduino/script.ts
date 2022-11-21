import { fromEvent, merge } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";
interface BESerialPort {
  path: string;
  manufacturer: string;
  serialNumber: string;
  locationId: string;
  vendorId: string;
  productId: string;
}

const pinH = document.querySelector<HTMLButtonElement>(`[data-pin-h]`)!;
const pinL = document.querySelector<HTMLButtonElement>(`[data-pin-l]`)!;
const connectButtonEl = document.querySelector<HTMLElement>(`[data-connect]`)!;
const statusEl = document.querySelector<HTMLElement>(`[data-status]`)!;
const readerEl = document.querySelector<HTMLElement>(`[data-reader]`)!;

const serialPortEl =
  document.querySelector<HTMLSelectElement>(`[data-serial-port]`)!;

const pinH$ = fromEvent(pinH, "click").pipe(map(() => "H"));
const pinL$ = fromEvent(pinL, "click").pipe(map(() => "L"));

fromEvent(serialPortEl, "change").subscribe(() => {
  statusEl.innerHTML = ``;
});

fromEvent(connectButtonEl, "click")
  .pipe(
    switchMap(() => {
      const searchParams = new URLSearchParams();
      searchParams.set("path", serialPortEl.value);
      return fromFetch(`/connect?${searchParams}`, {
        method: "GET",
        selector: (res) => res.json(),
      }).pipe(
        tap((response) => {
          statusEl.innerHTML = `<span>${
            response.success ? "connected" : "failure"
          }</span>`;
        })
      );
    })
  )
  .subscribe();

fromFetch<BESerialPort[]>("/list-serial", {
  method: "GET",
  selector: (res) => res.json(),
}).subscribe((list) => {
  serialPortEl.innerHTML = "";
  for (const item of list) {
    serialPortEl.innerHTML += `<option value="${item.path}">${item.path}</option>`;
  }
});

const rxWebsocket = webSocket({
  url: "ws://localhost:4000",
  deserializer: ({ data }) => {
    return data;
  },
  serializer: (msg) => {
    return JSON.stringify({ msg });
  },
  openObserver: {
    next: () => {
      console.log("open");
    },
  },
});

rxWebsocket.subscribe((value) => {
  readerEl.innerHTML += `<div>
    ${value}
    </div>`;
});

merge(pinH$, pinL$)
  .pipe(distinctUntilChanged())
  .subscribe((pinValue) => {
    rxWebsocket.next(pinValue);
  });
