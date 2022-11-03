import http from "http";
import { hostname } from "os";
import { defer, MonoTypeOperatorFunction, Observable, Subject } from "rxjs";
import { filter, share, tap } from "rxjs/operators";
import * as NodeURL from "url";
import * as NodePath from "path";
import fs from "fs";

export interface ClientMessage {
  request: http.IncomingMessage;
  response: http.ServerResponse;
}

export class HttpCreateServer extends Observable<void> {
  private readonly clientMessage$ = this.createServer().pipe(share());
  private readonly backlog$ = new Subject<void>();

  constructor(
    public options: {
      port: number;
      hostname?: string;
    }
  ) {
    super((subscriber) => {
      return this.backlog$.subscribe(subscriber);
    });
  }

  static(path: string) {
    return this.clientMessage$.pipe(
      tap((httpClient) => {
        const { request, response } = httpClient;

        const parsed = NodeURL.parse(request.url!, true);
        const requestPathName = parsed.pathname!;
        const ext = NodePath.extname(requestPathName);
        if (ext) {
          const directoryPath = NodePath.join(path, requestPathName);
          fs.stat(directoryPath, (err, stat) => {
            if (err) {
              response.writeHead(404, {
                "Content-Type": "text/plain",
              });
              response.end("404 Not Found");
              return;
            }

            let contentType = "text/plain";

            switch (ext) {
              case ".png":
                contentType = "image/png";
                break;
              case ".html":
                contentType = "text/html";
                break;
            }

            response.writeHead(200, {
              "Content-Type": contentType,
            });
            fs.readFile(directoryPath, function (err, content) {
              // Serving the image
              response.end(content);
            });
          });
        }
      })
    );
  }

  get(url: string) {
    return this.clientMessage$.pipe(
      this.whenRoute({ method: "GET", url }),
      share()
    );
  }

  post(url: string) {
    return this.clientMessage$.pipe(
      this.whenRoute({ method: "POST", url }),
      share()
    );
  }

  option(url: string) {
    return this.clientMessage$.pipe(
      this.whenRoute({ method: "OPTIONS", url }),
      share()
    );
  }

  private createServer() {
    return new Observable<ClientMessage>((subscriber) => {
      const server = http
        .createServer((request, response) => {
          subscriber.next({ request, response });
        })
        .listen(this.options.port, this.options.hostname || "localhost", () => {
          this.backlog$.next();
        });

      return {
        unsubscribe: () => {
          server.close();
        },
      };
    });
  }

  private whenRoute(options: {
    url: string;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "DELETE";
  }): MonoTypeOperatorFunction<ClientMessage> {
    return filter((httpClient) => {
      const { request } = httpClient;

      const parsed = NodeURL.parse(request.url!, true);

      return (
        request.method === options.method && parsed.pathname === options.url
      );
    });
  }
}

// export function httpCreateServer(options: {
//   port: number;
//   hostname?: string;
//   backlog?: () => void;
// }) {
//   let refCount = 0;
//   const onClientRequest$ = new Subject<ClientMessage>();
//   const server = http
//     .createServer((request, response) => {
//       onClientRequest$.next({ request, response });
//     })
//     .listen(options.port, options.hostname || "localhost", () => {
//       options.backlog?.();
//     });

//   return new Observable<ClientMessage>((subscriber) => {
//     refCount++;
//     const subscription = onClientRequest$.subscribe(subscriber);

//     return {
//       unsubscribe: () => {
//         subscription.unsubscribe();
//         refCount--;
//         if (refCount === 0) {
//           server.close();
//         }
//       },
//     };
//   });
// }

// export function whenRequestUrl(
//   url: string
// ): MonoTypeOperatorFunction<ClientMessage> {
//   return filter(({ request }) => {
//     return isMatchRoutePath(request.url, url);
//   });
// }

// export function isMatchRoutePath(url: string | undefined, routePath: string) {
//   if (url !== undefined) {
//     const parseUrl = new URL(`http://localhost:4200${url}`);
//     return parseUrl.pathname === routePath;
//   }
//   return false;
// }

// export function whenRoute(options: {
//   url: string;
//   method: "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";
// }): MonoTypeOperatorFunction<ClientMessage> {
//   return filter((client) => {
//     return (
//       client.request.method === options.method &&
//       isMatchRoutePath(client.request.url, options.url)
//     );
//   });
// }
