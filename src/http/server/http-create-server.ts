import http from "http";
import { hostname } from "os";
import { MonoTypeOperatorFunction, Observable } from "rxjs";
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
  return new Observable<ClientMessage>((subscriber) => {
    const server = http
      .createServer((req, res) => {
        subscriber.next({ request: req, response: res });
      })
      .listen(options.port, options.hostname || "localhost", () => {
        options.backlog?.();
      });

    return {
      unsubscribe: () => {
        server.close();
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
  method: "GET" | "POST" | "PATCH" | "DELETE";
}): MonoTypeOperatorFunction<ClientMessage> {
  return filter((client) => {
    return (
      client.request.method === options.method &&
      isMatchRoutePath(client.request.url, options.url)
    );
  });
}
