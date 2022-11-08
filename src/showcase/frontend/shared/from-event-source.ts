import { fromEvent } from "rxjs";
import { finalize, map, switchMap } from "rxjs/operators";
import {} from "rxjs/fetch";

export function fromEventSource(url: string) {
  const events = new EventSource(url);
  return fromEvent(events, "open").pipe(
    finalize(() => {
      events.close();
    }),
    switchMap(() => {
      return fromEvent<MessageEvent>(events, "message").pipe(
        map((event) => event.data)
      );
    })
  );
}
