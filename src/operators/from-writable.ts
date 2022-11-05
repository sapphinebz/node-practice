import { Observable } from "rxjs";
import { addAbortSignal, Writable } from "stream";

export function fromWritable<T = any>(writable: Writable) {
  return new Observable<T>((subscriber) => {
    const controller = new AbortController();
    const write = addAbortSignal(controller.signal, writable);
    write.on("error", (err) => {
      subscriber.error(err);
    });
    write.on("close", () => {
      subscriber.complete();
    });
    write.on("finish", () => {
      subscriber.next();
      subscriber.complete();
    });

    return {
      unsubscribe: () => {
        controller.abort();
      },
    };
  });
}
