import { Observable } from "rxjs";
import { httpGetStream } from "./http-stream-get";

export function httpJsonGet<T = any>(url: string): Observable<T> {
  return new Observable<T>((subscriber) => {
    let chunks: string;
    return httpGetStream(url).subscribe({
      next: (chunk) => {
        chunks = chunk;
      },
      error: (err) => {
        subscriber.error(err);
      },
      complete: () => {
        try {
          const json: T = JSON.parse(chunks);
          subscriber.next(json);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      },
    });
  });
}
