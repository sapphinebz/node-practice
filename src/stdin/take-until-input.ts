import { MonoTypeOperatorFunction, Observable } from "rxjs";
import {} from "rxjs/fetch";

export function takeUntilInput(
  inputLine: string
): MonoTypeOperatorFunction<string> {
  return (source: Observable<string>) =>
    new Observable<string>((subscriber) => {
      return source.subscribe({
        next: (line) => {
          if (line.trim() === inputLine) {
            subscriber.complete();
            process.exit();
          } else {
            subscriber.next(line);
          }
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
          process.exit();
        },
      });
    });
}
