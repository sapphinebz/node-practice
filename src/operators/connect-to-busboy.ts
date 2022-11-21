import {
  AsyncSubject,
  EMPTY,
  merge,
  Observable,
  Subject,
  Subscription,
} from "rxjs";
import express from "express";
import { Readable } from "stream";
import { fromListener } from "./from-listener";
import {
  catchError,
  map,
  mergeMap,
  take,
  takeUntil,
  tap,
} from "rxjs/operators";

const busboy = require("busboy");

interface BusboyInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

export function connectToBusboy(
  busboyOptions: {
    /**
     * Various limits on incoming data. Valid properties are:
     */
    limits?: {
      /**
       * Max field name size (in bytes). Default: 100
       */
      fieldNameSize?: number;
      /**
       * Max field value size (in bytes). Default: 1048576 (1MB).
       */
      fieldSize?: number;
      /**
       * Max number of non-file fields. Default: Infinity
       */
      fields?: number;
      /**
       * For multipart forms, the max file size (in bytes). Default: Infinity
       */
      fileSize?: number;
      /**
       * For multipart forms, the max number of file fields. Default: Infinity
       */
      files?: number;
      /**
       * For multipart forms, the max number of parts (fields + files). Default: Infinity.
       */
      parts?: number;
      /**
       * For multipart forms, the max number of header key-value pairs to parse. Default: 2000 (same as node's http module).


       */
      headerPairs?: number;
    };
  } = {}
) {
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
      onError$: Observable<{
        error: any;
        request: express.Request;
        response: express.Response;
      }>;
    }>((subscriber) => {
      const onUnsubscribe$ = new AsyncSubject<void>();

      source.pipe(takeUntil(onUnsubscribe$)).subscribe({
        next: ({ request, response }) => {
          let bb: any;
          try {
            bb = busboy({ headers: request.headers, ...busboyOptions });
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
          const onError$ = new AsyncSubject<{
            error: any;
            request: express.Request;
            response: express.Response;
          }>();

          subscriber.next({
            onFile$,
            onClose$,
            onField$,
            onError$,
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

          // ERROR
          const partsLimit$ = fromListener(bb, "partsLimit").pipe(
            map(() => new Error("LIMIT_PART_COUNT"))
          );
          const filesLimit$ = fromListener(bb, "filesLimit").pipe(
            map(() => new Error("LIMIT_FILE_COUNT"))
          );
          const fieldsLimit$ = fromListener(bb, "fieldsLimit").pipe(
            map(() => new Error("LIMIT_FIELD_COUNT"))
          );

          const bbError$ = fromListener(bb, "error");

          const limitError$ = onFile$.pipe(
            mergeMap(({ file, fieldname }) => {
              const limit$ = fromListener(file, "limit").pipe(
                map(() => new Error(`LIMIT_FILE_SIZE ${fieldname}`))
              );

              const error$ = fromListener(file, "error");

              return merge(limit$, error$);
            })
          );

          const error$ = merge(
            partsLimit$,
            filesLimit$,
            fieldsLimit$,
            bbError$,
            limitError$
          ).pipe(
            tap((error) => {
              onError$.next({ error, request, response });
            })
          );

          const close$ = fromListener(bb, "close");
          const finish$ = fromListener(bb, "finish").pipe(
            takeUntil(onError$),
            tap(() => {
              onClose$.next({
                request,
                response,
              });
            })
          );

          merge(close$, finish$, error$)
            .pipe(take(1), takeUntil(onUnsubscribe$))
            .subscribe({
              next: () => {
                onClose$.complete();
                onField$.complete();
                onFile$.complete();
                onError$.complete();
              },
              complete: () => {
                // request.unpipe(bb);
                // bb.removeAllListeners();
              },
            });

          request.pipe(bb);
        },
        error: (err) => {
          subscriber.error(err);
        },
        complete: () => {
          subscriber.complete();
        },
      });

      return {
        unsubscribe: () => {
          onUnsubscribe$.next();
          onUnsubscribe$.complete();
        },
      };
    });
}
