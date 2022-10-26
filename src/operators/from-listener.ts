import { Observable } from "rxjs";
import { EventEmitter } from "stream";

export function fromListener<T = any>(
  eventStream: EventEmitter,
  eventName: string
) {
  return new Observable<T>((subscriber) => {
    const handler = (event: T) => {
      subscriber.next(event);
    };
    eventStream.addListener(eventName, handler);
    return {
      unsubscribe: () => {
        eventStream.removeListener(eventName, handler);
      },
    };
  });
}
