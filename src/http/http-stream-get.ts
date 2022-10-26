import http from "http";
import https from "https";
import { Observable } from "rxjs";
export function httpGetStream(url: string) {
  return new Observable<string>((subscriber) => {
    const abortController = new AbortController();
    const httpClient = url.startsWith("https") ? https : http;
    httpClient
      .get(
        url,
        { method: "GET", signal: abortController.signal },
        (response) => {
          let str = "";
          response.on("data", (chunk) => {
            str += chunk;
            subscriber.next(str);
          });
          response.on("end", () => {
            subscriber.complete();
          });
        }
      )
      .end();

    return () => {
      abortController.abort();
    };
  });
}
