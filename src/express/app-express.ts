import express from "express";
import { Query } from "express-serve-static-core";
import { MonoTypeOperatorFunction, Observable, Subject, tap } from "rxjs";

export interface ClientRequestHttp {
  request: express.Request;
  response: express.Response;
}

export interface TypedRequestParam extends ClientRequestHttp {
  param: { [key: string]: string };
}

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

export interface TypedRequestQuery<T extends Query> extends Express.Request {
  query: T;
}

export interface TypedRequest<T extends Query, U> extends Express.Request {
  body: U;
  query: T;
}

export interface ClientHttpPost<T> {
  request: TypedRequestBody<T>;
  response: express.Response;
}

export class AppExpress {
  app = express();

  constructor(options: { port: number }) {
    this.app
      .use(express.urlencoded({ extended: true }))
      .use(express.json())
      .use(express.raw());

    this.createServer(options.port);
  }

  options(path: string) {
    return this.createRouteObservable((next) => {
      this.app.options(path, (request, response) => {
        next({ request, response });
      });
    });
  }

  optionCorsOrigin(
    origin: string
  ): MonoTypeOperatorFunction<ClientRequestHttp> {
    return tap(({ response }) => {
      response.writeHead(204, {
        // "Access-Control-Allow-Origin": "http://localhost:4200",
        // "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers":
          "access-control-allow-origin,Content-Type,Authorization",
        // "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      });
      response.end();
    });
  }

  setHeaderAllowOrigin<T extends ClientRequestHttp>(
    origin: string
  ): MonoTypeOperatorFunction<T> {
    return tap(({ response }) => {
      response.setHeader("Access-Control-Allow-Origin", origin);
    });
  }

  get(path: string) {
    return this.createRouteObservable((next) => {
      this.app.get(path, (request, response) => {
        next({ request, response });
      });
    });
  }

  post<TBody = any>(path: string) {
    return this.createRouteObservable<ClientHttpPost<TBody>>((next) => {
      this.app.post(
        path,
        (request: TypedRequestBody<TBody>, response: express.Response) => {
          next({ request, response });
        }
      );
    });
  }

  delete(path: string) {
    return this.createRouteObservable<TypedRequestParam>((next) => {
      this.app.delete(path, (request, response) => {
        next({ request, response, param: request.params });
      });
    });
  }

  // middleware pattern
  // (req, res, next) => {
  //   console.log('the response will be sent by the next function ...')
  //   next()
  // }

  // notFound() {
  //   const clientHttp$ = new Subject<ClientRequestHttp>();
  //   this.app.use((req, res) => {
  //     clientHttp$.next({ request: req, response: res });
  //   });
  //   return new Observable<ClientRequestHttp>((subscriber) => {
  //     return clientHttp$.subscribe(subscriber);
  //   });
  // }

  //routing
  //https://expressjs.com/en/guide/routing.html

  notFound() {
    return this.createRouteObservable((next) => {
      const route = this.app.all("*", (request, response) => {
        next({ request, response });
      });
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
