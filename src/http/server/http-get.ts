import { MonoTypeOperatorFunction, Observable } from "rxjs";
import http from "http";
import https from "https";
import { filter } from "rxjs/operators";
import { ClientMessage } from "./http-create-server";
import url from "url";
import { httpGetStream } from "../http-stream-get";

export function httpGet<T = string>(
  url: string,
  selector?: (chunks: string) => T
) {
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
          const value = selector ? selector(chunks) : (chunks as T);
          subscriber.next(value);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      },
    });
  });
}

export function whenQuery(
  predicate: (queryObject: any) => boolean
): MonoTypeOperatorFunction<ClientMessage> {
  return filter(({ request }) => {
    return request.url !== undefined && predicate(getQueryObject(request));
  });
}

export function getQueryObject(request: http.IncomingMessage) {
  if (request.url !== undefined) {
    return url.parse(request.url, true).query;
  }
  return {};
}
