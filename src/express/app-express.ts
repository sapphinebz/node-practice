import express, { ErrorRequestHandler, RequestHandler } from "express";
import { Query } from "express-serve-static-core";
import { ParsedUrlQuery } from "querystring";
import {
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  Subject,
} from "rxjs";
import { map, tap } from "rxjs/operators";
import url from "url";

export interface ClientRequestHttp {
  request: express.Request;
  response: express.Response;
}

export interface ParamClientRequestHttp extends ClientRequestHttp {
  param: { [key: string]: string };
}

export interface BodyClientRequestHttp<T = any> extends ClientRequestHttp {
  body: T;
}

export interface QueryClientRequestHttp extends ClientRequestHttp {
  query: ParsedUrlQuery | null;
}

export interface TypedRequest<T extends Query, U> extends Express.Request {
  body: U;
  query: T;
}

export class AppExpress {
  app = express();

  emptyMiddleware: RequestHandler = (request, response, next) => {
    next();
  };

  constructor(options: { port: number }) {
    // this.app;
    // Parse URL-encoded bodies (as sent by HTML forms)
    // .use(express.urlencoded({ extended: true }));
    // Parse JSON bodies (as sent by API clients)
    // .use(express.json())
    // .use(express.raw());

    this.createServer(options.port);
  }

  noCacheResponse() {
    this.app.use(this.setHeaders({ "Cache-Control": "no-cache" }));
  }

  static(prefixPath: string, staticPath: string): void;
  static(staticPath: string): void;
  static(prefixPath: string, staticPath?: string): void {
    if (prefixPath && staticPath) {
      this.app.use(prefixPath, express.static(staticPath));
    } else if (prefixPath) {
      let _staticPath = prefixPath;
      this.app.use(express.static(_staticPath));
    }
  }

  redirectTo<T extends ClientRequestHttp>(
    path: string
  ): MonoTypeOperatorFunction<T> {
    return tap(({ response }) => {
      // response.writeHead(301, { Location: path }).end();
      response.redirect(301, path);
    });
  }

  options(path: string, options: { origin: string }) {
    return this.createRouteObservable((next) => {
      this.app.options(path, (request, response) => {
        response.writeHead(204, {
          "Access-Control-Allow-Origin": options.origin,
          "Access-Control-Allow-Headers":
            "access-control-allow-origin,Content-Type,Authorization",
          "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        });
        response.end();
        next({ request, response });
      });
    });
  }

  setHeaderAllowOrigin<T extends ClientRequestHttp>(
    origin: string
  ): MonoTypeOperatorFunction<T> {
    return tap(({ response }) => {
      response.setHeader("Access-Control-Allow-Origin", origin);
    });
  }

  get(path: string): Observable<ClientRequestHttp>;
  get(path: string, middleware: RequestHandler): Observable<ClientRequestHttp>;
  get(
    path: string,
    middleware?: RequestHandler
  ): Observable<ClientRequestHttp> {
    return this.createRouteObservable((next) => {
      this.app.get(
        path,
        middleware ?? this.emptyMiddleware,
        (request, response) => {
          next({ request, response });
        }
      );
    });
  }

  post<TBody = any>(path: string): Observable<BodyClientRequestHttp<TBody>>;
  post<TBody = any>(
    path: string,
    middleware: RequestHandler
  ): Observable<BodyClientRequestHttp<TBody>>;
  post<TBody = any>(
    path: string,
    middleware?: RequestHandler
  ): Observable<BodyClientRequestHttp<TBody>> {
    return this.createRouteObservable<BodyClientRequestHttp<TBody>>((next) => {
      this.app.post(
        path,
        middleware ?? this.emptyMiddleware,
        (request, response) => {
          next({ request, response, body: request.body });
        }
      );
    });
  }

  delete(path: string): Observable<ParamClientRequestHttp>;
  delete(
    path: string,
    middleware: RequestHandler
  ): Observable<ParamClientRequestHttp>;
  delete(
    path: string,
    middleware?: RequestHandler
  ): Observable<ParamClientRequestHttp> {
    return this.createRouteObservable<ParamClientRequestHttp>((next) => {
      this.app.delete(
        path,
        middleware ?? this.emptyMiddleware,
        (request, response) => {
          next({ request, response, param: request.params });
        }
      );
    });
  }

  withQuery<T extends ClientRequestHttp>(): OperatorFunction<
    T,
    T & QueryClientRequestHttp
  > {
    return map((client) => {
      if (client.request.url) {
        const query = url.parse(client.request.url, true).query;
        return { ...client, query };
      }
      return { ...client, query: null };
    });
  }

  useError(errorRequestHandler: ErrorRequestHandler) {
    return this.app.use(errorRequestHandler);
    // return new Observable<{
    //   error: any;
    //   request: express.Request;
    //   response: express.Response;
    //   next: NextFunction;
    // }>((subscriber) => {
    //   const errorHandler: ErrorRequestHandler = (
    //     err,
    //     request,
    //     response,
    //     next
    //   ) => {
    //     subscriber.next({ error: err, request, response, next });
    //   };
    //   this.app.use(errorHandler);
    // });
  }

  use(requestHandler: RequestHandler) {
    return this.app.use(requestHandler);
    //   return new Observable<{
    //     request: express.Request;
    //     response: express.Response;
    //     next: NextFunction;
    //   }>((subscriber) => {
    //     const requestHandler: RequestHandler = (request, response, next) => {
    //       subscriber.next({ request, response, next });
    //     };
    //     this.app.use(requestHandler);
    //   });
  }

  //routing
  //https://expressjs.com/en/guide/routing.html

  download<T extends ClientRequestHttp>(
    path: string
  ): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) =>
      new Observable<T>((subscriber) => {
        return source.subscribe({
          next: (client) => {
            client.response.download(path, (err) => {
              if (err) {
                subscriber.error(err);
              } else {
                subscriber.next(client);
                subscriber.complete();
              }
            });
          },
          error: (err) => {
            subscriber.error(err);
          },
          complete: () => {
            subscriber.complete();
          },
        });
      });
  }

  notFound() {
    return this.createRouteObservable((next) => {
      const requestHandler: RequestHandler = (request, response) => {
        next({ request, response });
      };
      const route = this.app.all("*", requestHandler);
    });
  }

  createRouteObservable<T = ClientRequestHttp>(
    project: (next: (clientRequest: T) => void) => void
  ) {
    let refCount = 0;
    const clientHttp$ = new Subject<T>();

    project((clientRequest) => {
      clientHttp$.next(clientRequest);
    });

    return new Observable<T>((subscriber) => {
      refCount++;
      const subscription = clientHttp$.subscribe(subscriber);
      return {
        unsubscribe: () => {
          refCount--;
          subscription.unsubscribe();
        },
      };
    });
  }

  createServer(port: number) {
    this.app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
    return this.app;
  }

  /**
   * MiddleWare
   */
  private setHeaders(headers: any): RequestHandler {
    return (req, res, next) => {
      res.set(headers);
      next();
    };
  }
}

// app.use(express.static("public"));
/**
 * เป็นการบอกว่า ถ้าเล่นผ่าน localhost:4200 แบบ path ไม่มี
 * จะไปอ่าน index.html ใน folder public ให้อัตโนมัติ โดยเราไม่ต้องเขียน route เอง
 */

// สร้าง Middle ware
//  const logMethod: express.RequestHandler = (request, response, next) => {
//   console.log("---method", request.method);
//   next();
// };
