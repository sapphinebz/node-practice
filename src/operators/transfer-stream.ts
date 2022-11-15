import { MonoTypeOperatorFunction, Observable } from "rxjs";
import { Writable } from "stream";

export function transferStream<T>(
  stream: Writable
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const subscription = source.subscribe({
        next(value) {
          stream.write(value);
          subscriber.next(value);
        },
        error(err) {
          stream.emit("error", err);
        },
        complete() {
          stream.end();
          subscriber.complete();
        },
      });

      subscription.add(() => {
        stream.end();
      });

      return subscription;
    });
}
