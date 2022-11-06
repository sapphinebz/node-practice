import { fromEvent } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { exhaustMap, filter, map, withLatestFrom } from "rxjs/operators";

const uploadEl = document.querySelector<HTMLInputElement>("[data-upload]")!;
const file$ = fromEvent(uploadEl, "change").pipe(
  filter(() => {
    return uploadEl.files!.length > 0;
  }),
  map(() => uploadEl.files![0])
);

const submitBtnEl = document.querySelector("[data-submit]")!;
fromEvent(submitBtnEl, "click")
  .pipe(
    withLatestFrom(file$),
    exhaustMap(([_, file]) => {
      return fromFetch("/send", {
        method: "POST",
        body: file,
        // duplex: "half",
        selector: (res) => res.json(),
      });
    })
  )
  .subscribe((res) => {
    console.log(res);
    // alert("upload complete");
    uploadEl.value = "";

    // (async function () {
    //   const reader = res.body.getReader();
    //   reader.read().then(console.log);
    //   console.log(reader);
    //   // for await (const { value, done } of reader.read()) {
    //   //   if (done) break;
    //   //   console.log("Received", value);
    //   // }
    // })();
  });

// const body = new ReadableStream({
//   start: (controller) => {
//     const encoder = new TextEncoder();
//     controller.enqueue(encoder.encode("Test"));
//     controller.close();
//   },
// });
// fetch("/send", {
//   method: "POST",
//   body: body,
//   duplex: "half",
// });
