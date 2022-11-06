// import {} from "rxjs";
// import {} from "rxjs/operators";
import { fromFetch } from "rxjs/fetch";

const channel = 1;
const streamReceiver$ = fromFetch(`/receive?channel=${channel}`, {
  selector: async function* (res) {
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  },
});

const receiverEl = document.querySelector("[data-receiver]")!;
streamReceiver$.subscribe((value) => {
  receiverEl.innerHTML += `<div>${value}</div>`;
});
