import { Observable } from "rxjs";
import { EventEmitter } from "stream";

export function fromListener<T = any>(
  eventStream: EventEmitter,
  eventName: string,
  options?: { once?: boolean; args?: boolean }
) {
  return new Observable<any>((subscriber) => {
    const handler = (...event: any) => {
      subscriber.next(options?.args ? event : event[0]);
      if (options?.once) {
        subscriber.complete();
      }
    };
    eventStream.addListener(eventName, handler);
    return {
      unsubscribe: () => {
        eventStream.removeListener(eventName, handler);
      },
    };
  });
}
