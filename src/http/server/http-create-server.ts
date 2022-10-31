import http from "http";
import { hostname } from "os";
import { MonoTypeOperatorFunction, Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import url, { URL } from "url";

export interface ClientMessage {
  request: http.IncomingMessage;
  response: http.ServerResponse;
}

export function httpCreateServer(options: {
  port: number;
  hostname?: string;
  backlog?: () => void;
}) {
  let refCount = 0;
  const onClientRequest$ = new Subject<ClientMessage>();
  const server = http
    .createServer((request, response) => {
      onClientRequest$.next({ request, response });
    })
    .listen(options.port, options.hostname || "localhost", () => {
      options.backlog?.();
    });

  return new Observable<ClientMessage>((subscriber) => {
    refCount++;
    const subscription = onClientRequest$.subscribe(subscriber);

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
        refCount--;
        if (refCount === 0) {
          server.close();
        }
      },
    };
  });
}

export function whenRequestUrl(
  url: string
): MonoTypeOperatorFunction<ClientMessage> {
  return filter(({ request }) => {
    return isMatchRoutePath(request.url, url);
  });
}

export function isMatchRoutePath(url: string | undefined, routePath: string) {
  if (url !== undefined) {
    const parseUrl = new URL(`http://localhost:4200${url}`);
    return parseUrl.pathname === routePath;
  }
  return false;
}

export function whenRoute(options: {
  url: string;
  method: "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";
}): MonoTypeOperatorFunction<ClientMessage> {
  return filter((client) => {
    return (
      client.request.method === options.method &&
      isMatchRoutePath(client.request.url, options.url)
    );
  });
}
