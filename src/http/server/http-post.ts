import http from "http";
import { mergeMap, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ClientMessage } from "./http-create-server";

export function withPostBody() {
  return (source: Observable<ClientMessage>) =>
    source.pipe(
      mergeMap((client) => {
        return parseJsonPostBody(client.request).pipe(
          map((body) => [client, body] as const)
        );
      })
    );
}

export function parseJsonPostBody(request: http.IncomingMessage) {
  return new Observable<any>((subscriber) => {
    let body = "";
    request.on("data", (data) => {
      body += data;
    });
    request.on("end", function () {
      subscriber.next(JSON.parse(body));
      subscriber.complete();
    });
  });
}
