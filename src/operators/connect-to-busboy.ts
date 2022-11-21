import { AsyncSubject, Observable, Subject, Subscription } from "rxjs";
import express from "express";
import { Readable } from "stream";

const busboy = require("busboy");

interface BusboyInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

export function connectToBusboy() {
  return (
    source: Observable<{ request: express.Request; response: express.Response }>
  ) =>
    new Observable<{
      onFile$: Observable<{
        fieldname: string;
        file: Readable;
        info: BusboyInfo;
        request: express.Request;
        response: express.Response;
      }>;
      onField$: Observable<{
        fieldname: string;
        value: any;
        info: BusboyInfo;
        request: express.Request;
        response: express.Response;
      }>;
      onClose$: Observable<{
        request: express.Request;
        response: express.Response;
      }>;
    }>((subscriber) => {
      const subscription = new Subscription();

      const mainSub = source.subscribe({
        next: ({ request, response }) => {
          let bb: any;
          try {
            bb = busboy({ headers: request.headers });
          } catch (err) {
            subscriber.error(err);
          }

          const onFile$ = new Subject<{
            fieldname: string;
            file: Readable;
            info: BusboyInfo;
            request: express.Request;
            response: express.Response;
          }>();
          const onField$ = new Subject<{
            fieldname: string;
            value: any;
            info: BusboyInfo;
            request: express.Request;
            response: express.Response;
          }>();
          const onClose$ = new AsyncSubject<{
            request: express.Request;
            response: express.Response;
          }>();

          subscriber.next({
            onFile$,
            onClose$,
            onField$,
          });

          bb.on(
            "file",
            (fieldname: string, file: Readable, info: BusboyInfo) => {
              onFile$.next({
                fieldname,
                file,
                info,
                request,
                response,
              });
            }
          );

          bb.on("field", (fieldname: string, value: any, info: any) => {
            onField$.next({ fieldname, value, info, request, response });
          });

          bb.on("close", () => {
            onClose$.next({
              request,
              response,
            });
            onClose$.complete();
            onField$.complete();
            onFile$.complete();
          });

          bb.on("error", (err: any) => {
            subscriber.error(err);
          });

          request.pipe(bb);

          subscription.add(() => {
            onClose$.unsubscribe();
            onField$.unsubscribe();
            onFile$.unsubscribe();
            request.unpipe(bb);
            bb.removeAllListeners();
          });
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      subscription.add(mainSub);

      return subscription;
    });
}
