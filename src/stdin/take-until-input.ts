import { MonoTypeOperatorFunction, Observable, take } from "rxjs";
import {} from "rxjs/fetch";
import { filter, takeUntil, tap } from "rxjs/operators";
import { fromCmdInput } from "./from-cmd-input";

export function takeUntilInput<T>(
  inputLine: string
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const onMatchedInput$ = fromCmdInput().pipe(
        filter((line) => line.trim() === inputLine),
        tap(() => {
          setImmediate(() => process.exit());
        }),
        take(1)
      );
      return source.pipe(takeUntil(onMatchedInput$)).subscribe(subscriber);
    });
}
