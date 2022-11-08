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
import { createFolderIfNotExist } from "../../folder/create-folder-if-not-exist";
import { Readable } from "stream";
export interface BusBoyInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

export interface BusBoyIncomingFile {
  fieldname: string;
  file: any;
  info: BusBoyInfo;
  request: http.IncomingMessage;
}

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

  option(url: string, options: { origin: string }) {
    return this.clientMessage$.pipe(
      this.whenRoute({ method: "OPTIONS", url }),
      tap(({ response }) => {
        response.writeHead(204, {
          // "Access-Control-Allow-Origin": "http://localhost:4200",
          // "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Origin": options.origin,
          "Access-Control-Allow-Headers":
            "access-control-allow-origin,Content-Type,Authorization",
          // "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        });
        response.end();
      }),
      share()
    );
  }

  redirectTo(path: string): MonoTypeOperatorFunction<ClientMessage> {
    return tap(({ response }) => {
      response.writeHead(301, { Location: path }).end();
      // res.writeHead(303, { Connection: 'close', Location: '/' });
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

  // https://www.npmjs.com/package/busboy
  withFormData<T = any>(fileOptions?: {
    filePath: (busboyFile: BusBoyIncomingFile) => string;
    // onData: (buffer: string | Buffer, busboyFile: BusBoyIncomingFile) => void;
  }) {
    const busboy = require("busboy");
    return (source: Observable<ClientMessage>) =>
      new Observable<ClientMessage & { formData: T }>((subscriber) => {
        let bb: any;
        const subscription = source.subscribe({
          next: (client) => {
            const { request, response } = client;
            let formData = {} as any;

            try {
              bb = busboy({ headers: request.headers });
            } catch (err) {
              subscriber.error(err);
            }

            // fieldname, fileStream, filename, encoding, mimetype
            // ตัวไหนเป็น file มันเข้าอันนี้เอง
            if (fileOptions?.filePath) {
              bb.on(
                "file",
                (fieldname: string, file: Readable, info: BusBoyInfo) => {
                  const { filename, encoding, mimeType } = info;
                  console.log(
                    `File [${fieldname}]: filename: %j, encoding: %j, mimeType: %j`,
                    filename,
                    encoding,
                    mimeType
                  );
                  const filePath = fileOptions.filePath({
                    fieldname,
                    file,
                    info,
                    request,
                  });
                  createFolderIfNotExist(filePath);
                  const writeStream = fs.createWriteStream(filePath);
                  file.pipe(writeStream);
                  // file
                  //   .on("data", (data: any) => {
                  //     writeStream.write(data);
                  //     console.log(`File [${fieldname}] got ${data.length} bytes`);
                  //   })
                  //   .on("close", () => {
                  //     writeStream.end();
                  //     console.log(`File [${fieldname}] done`);
                  //   });
                }
              );
            }

            bb.on("field", (name: string, val: any, info: any) => {
              formData[name] = val;
            });
            bb.on("close", () => {
              subscriber.next({ ...client, formData });
              subscriber.complete();
              request.unpipe(bb);
            });
            request.pipe(bb);
          },
        });

        return {
          unsubscribe: () => {
            subscription.unsubscribe();
            bb.removeAllListeners();
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
