import express from "express";
import { Query } from "express-serve-static-core";
import { Observable, Subject } from "rxjs";

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

  options(path: string, middleWare?: express.RequestHandler) {
    const clientHttp$ = new Subject<ClientRequestHttp>();
    if (middleWare) {
      this.app.options(path, middleWare, (req, res) => {
        clientHttp$.next({ request: req, response: res });
      });
    } else {
      this.app.options(path, (req, res) => {
        clientHttp$.next({ request: req, response: res });
      });
    }
    return new Observable<ClientRequestHttp>((subscriber) => {
      return clientHttp$.subscribe(subscriber);
    });
  }

  get(path: string, middleWare?: express.RequestHandler) {
    const clientHttp$ = new Subject<ClientRequestHttp>();
    if (middleWare) {
      this.app.get(path, middleWare, (req, res) => {
        clientHttp$.next({ request: req, response: res });
      });
    } else {
      this.app.get(path, (req, res) => {
        clientHttp$.next({ request: req, response: res });
      });
    }

    return new Observable<ClientRequestHttp>((subscriber) => {
      return clientHttp$.subscribe(subscriber);
    });
  }

  post<TBody = any>(path: string) {
    const clientHttp$ = new Subject<ClientHttpPost<TBody>>();
    this.app.post(
      path,
      (req: TypedRequestBody<TBody>, res: express.Response) => {
        clientHttp$.next({ request: req, response: res });
      }
    );

    return new Observable<ClientHttpPost<TBody>>((subscriber) => {
      return clientHttp$.subscribe(subscriber);
    });
  }

  delete(path: string) {
    const clientHttp$ = new Subject<TypedRequestParam>();
    this.app.delete(path, (req, res) => {
      clientHttp$.next({ request: req, response: res, param: req.params });
    });

    return new Observable<TypedRequestParam>((subscriber) => {
      return clientHttp$.subscribe(subscriber);
    });
  }

  notFound() {
    const clientHttp$ = new Subject<ClientRequestHttp>();
    this.app.use((req, res) => {
      clientHttp$.next({ request: req, response: res });
    });
    return new Observable<ClientRequestHttp>((subscriber) => {
      return clientHttp$.subscribe(subscriber);
    });
  }

  createServer(port: number) {
    this.app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
    return this.app;
  }
}
