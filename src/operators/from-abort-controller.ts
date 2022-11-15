import { Observable } from "rxjs";
import {} from "rxjs/operators";
import {} from "rxjs/fetch";

export function fromAbortController<T = any>(
  project: (abortController: AbortController) => Promise<T>
) {
  return new Observable((subscriber) => {
    const abortController = new AbortController();
    project(abortController)
      .then((data) => {
        console.log("data", data);
        if (!subscriber.closed) {
          subscriber.next(data);
          subscriber.complete();
        }
      })
      .catch((err) => {
        subscriber.error(err);
      });
    return {
      unsubscribe: () => {
        abortController.abort();
      },
    };
  });
}
