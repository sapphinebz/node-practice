import http from "http";
import { hostname } from "os";
import {
  AsyncSubject,
  defer,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  Subject,
} from "rxjs";
import { filter, map, share, takeUntil, tap } from "rxjs/operators";
import * as NodeURL from "url";
import * as NodePath from "path";
import fs from "fs";
import url from "url";
import { ParsedUrlQuery } from "querystring";
import { fromListener } from "../../operators/from-listener";

export interface ClientMessage {
  request: http.IncomingMessage;
  response: http.ServerResponse;
}

export interface QueryClientMessage extends ClientMessage {
  query: ParsedUrlQuery | null;
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

            let contentType = "";

            switch (ext) {
              case ".png":
                contentType = "image/png";
                break;
              case ".html":
                contentType = "text/html";
                break;
              case ".txt":
                contentType = "text/plain";
              case ".js":
                contentType = "text/javascript; charset=utf-8";
            }

            if (contentType) {
              response.setHeader("Content-Type", contentType);
            }
            response.writeHead(200);

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

  redirectTo(path: string): MonoTypeOperatorFunction<ClientMessage> {
    return tap(({ response }) => {
      response.writeHead(301, { Location: path }).end();
    });
  }

  withQuery(): OperatorFunction<ClientMessage, QueryClientMessage> {
    return map((client) => {
      if (client.request.url) {
        const query = url.parse(client.request.url, true).query;
        return { ...client, query };
      }
      return { ...client, query: null };
    });
  }

  withJsonBody<T = any>() {
    return (source: Observable<ClientMessage>) =>
      new Observable<ClientMessage & { body: T }>((subscriber) => {
        const onUnsubscribe$ = new AsyncSubject<void>();
        const subscription = source.subscribe({
          next: (client) => {
            const { request } = client;
            let body = "";
            fromListener(request, "data")
              .pipe(takeUntil(onUnsubscribe$))
              .subscribe((data) => {
                body += data;
              });
            fromListener(request, "end")
              .pipe(takeUntil(onUnsubscribe$))
              .subscribe(() => {
                let json = null;
                try {
                  json = JSON.parse(body);
                } catch (err) {
                  subscriber.error(err);
                }
                if (json) {
                  subscriber.next({ ...client, body: json });
                  subscriber.complete();
                }
              });
          },
          error: (err) => {
            subscriber.error(err);
          },
        });

        return {
          unsubscribe: () => {
            subscription.unsubscribe();
            onUnsubscribe$.next();
            onUnsubscribe$.complete();
          },
        };
      });
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
