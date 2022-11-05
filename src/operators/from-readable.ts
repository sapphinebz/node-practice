import { Observable } from "rxjs";
import { addAbortSignal, Readable } from "stream";

export function fromReadable<T = any>(readable: Readable) {
  return new Observable<T>((subscriber) => {
    const controller = new AbortController();
    const read = addAbortSignal(controller.signal, readable);
    read.on("data", (data) => {
      subscriber.next(data);
    });
    read.on("end", () => {
      subscriber.complete();
    });

    read.on("close", () => {
      subscriber.complete();
    });

    read.on("error", (err) => {
      subscriber.error(err);
    });
    return {
      unsubscribe: () => {
        controller.abort();
      },
    };
  });
}
