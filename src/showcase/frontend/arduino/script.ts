import { fromEvent, merge } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { distinctUntilChanged, map } from "rxjs/operators";
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

const serialPortEl = document.querySelector<HTMLElement>(`[data-serial-port]`)!;

const pinH$ = fromEvent(pinH, "click").pipe(map(() => "H"));
const pinL$ = fromEvent(pinL, "click").pipe(map(() => "L"));

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
  deserializer: ({ data }) => data,
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
  console.log(value);
});

merge(pinH$, pinL$)
  .pipe(distinctUntilChanged())
  .subscribe((pinValue) => {
    rxWebsocket.next(pinValue);
  });
