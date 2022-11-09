import { Observable } from "rxjs";

export function fromXMLHttpRequestDownload(url: string, contentType?: string) {
  return new Observable<{ data?: Blob; percent: number }>((subscriber) => {
    let xhr = new XMLHttpRequest();
    let progress = { percent: 0 };

    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Access-Control-Allow-Origin", location.origin);

    xhr.onprogress = (event) => {
      progress = {
        ...progress,
        percent: (event.loaded / event.total) * 100,
      };
      subscriber.next(progress);
    };

    xhr.onload = () => {
      if (xhr.status != 200) {
        subscriber.error({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } else {
        const blob = new Blob([xhr.response], {
          type: contentType || xhr.getResponseHeader("Content-Type")!,
        });
        subscriber.next({ ...progress, data: blob });
        subscriber.complete();
      }
    };

    xhr.send();

    return {
      unsubscribe: () => {
        xhr.abort();
      },
    };
  });
}
