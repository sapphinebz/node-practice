import multer from "multer";
import path from "path";
import express, { RequestHandler } from "express";
import { Observable } from "rxjs";
import { ClientRequestHttp } from "../express/app-express";

export class UploadMulter {
  storage!: multer.StorageEngine;
  middlewareFactory!: multer.Multer;
  constructor(
    public options: {
      destination: string;
      filename:
        | string
        | ((request: express.Request, file: Express.Multer.File) => string);
    }
  ) {
    const filename = this.options.filename;
    this.storage = multer.diskStorage({
      destination: this.options.destination,
      filename(req, file, callback) {
        if (typeof filename === "string") {
          callback(null, filename);
        } else {
          callback(null, filename(req, file));
        }
      },
    });
    this.middlewareFactory = multer({
      storage: this.storage,
    });
  }

  uploadSingleFile(fieldName: string) {
    return this.uploadFactory((middlewareFactory) =>
      middlewareFactory.single(fieldName)
    );
  }

  uploadMultipleFiles(fieldName: string) {
    return this.uploadFactory((middlewareFactory) =>
      middlewareFactory.array(fieldName)
    );
  }

  private uploadFactory(
    factory: (middlewareFactory: multer.Multer) => RequestHandler
  ) {
    const upload = factory(this.middlewareFactory);
    return (source: Observable<ClientRequestHttp>) =>
      new Observable<ClientRequestHttp>((subscriber) => {
        return source.subscribe({
          next: (clientHttp) => {
            const { request, response } = clientHttp;
            upload(request, response, (err) => {
              if (err instanceof multer.MulterError) {
                subscriber.error(err);
                // A Multer error occurred when uploading.
              } else if (err) {
                subscriber.error(err);
                // An unknown error occurred when uploading.
              } else {
                subscriber.next(clientHttp);
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
}
