// import {} from "rxjs";
// import {} from "rxjs/operators";
import { share } from "rxjs";
import { fromFetch } from "rxjs/fetch";

const subscribe$ = fromFetch("/subscribe", {
  method: "GET",
  selector: async function* (res) {
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  },
}).pipe(share());

const stdInMessageEl = document.querySelector<HTMLElement>(
  "[data-stdin-message]"
)!;

subscribe$.subscribe((msg) => {
  stdInMessageEl.innerHTML += `<div>${msg}</div>`;
});
