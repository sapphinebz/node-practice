// import {} from "rxjs";
// import {} from "rxjs/operators";
import { exhaustMap, fromEvent, share } from "rxjs";
import { fromFetch } from "rxjs/fetch";

const subscribeBtnEl = document.querySelector<HTMLButtonElement>(
  "[data-subscribe-stdin]"
)!;

const subscribe$ = fromEvent(subscribeBtnEl, "click").pipe(
  exhaustMap(() => {
    return fromFetch("/subscribe", {
      method: "GET",
      selector: async function* (res) {
        const reader = res
          .body!.pipeThrough(new TextDecoderStream())
          .getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          yield value;
        }
      },
    });
  }),
  share()
);

const stdInMessageEl = document.querySelector<HTMLElement>(
  "[data-stdin-message]"
)!;

subscribe$.subscribe((msg) => {
  stdInMessageEl.innerHTML += `<div>${msg}</div>`;
});

const streamDiplexEl =
  document.querySelector<HTMLElement>(`[data-stream-duplex]`)!;

fromFetch("/news", {
  method: "GET",
  selector: async function* (res) {
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  },
}).subscribe((value) => {
  streamDiplexEl.innerHTML += `<div>${value}</div>`;
});
