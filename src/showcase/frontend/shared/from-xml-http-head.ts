import { Observable } from "rxjs";

// ใช้รักษา band-width
export function fromXMLHttpHead<T = any>(url: string) {
  return new Observable<T>((subscriber) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url);
    const loadHandler = () => {
      if (xhr.status != 200) {
        subscriber.error({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } else {
        subscriber.next(xhr.response);
        subscriber.complete();
      }
    };
    const errorHandler = (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
      subscriber.error(xhr.statusText);
    };
    xhr.addEventListener("load", loadHandler);
    xhr.addEventListener("error", errorHandler);

    xhr.send();

    return {
      unsubscribe() {
        xhr.removeEventListener("load", loadHandler);
        xhr.removeEventListener("error", errorHandler);
        xhr.abort();
      },
    };
  });
}
