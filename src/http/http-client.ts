import { IncomingMessage } from "http";
import https, { RequestOptions } from "https";
import { AsyncSubject, Observable, Subscription, takeUntil } from "rxjs";
import { fromListener } from "../operators/from-listener";

export interface StreamRequestOptions {
  effect: (response: IncomingMessage) => IncomingMessage;
}

export class HttpsClient {
  request<T = any>(options: RequestOptions | string | URL) {
    return new Observable<T>((subscriber) => {
      const subscription = new Subscription();
      console.log("request");

      const request = https.request(options, (response) => {
        subscription.add(
          fromListener(response, "error").subscribe((err) => {
            subscriber.error(err);
          })
        );

        subscription.add(
          fromListener(response, "data").subscribe((data) => {
            subscriber.next(data);
          })
        );

        subscription.add(
          fromListener(response, "end").subscribe(() => {
            subscriber.complete();
          })
        );
      });

      request.end();
      return subscription;
    });
  }

  get<T = any>(url: string | URL, options?: RequestOptions) {
    return new Observable<T>((subscriber) => {
      const abortController = new AbortController();
      const onUnsubscribe$ = new AsyncSubject<void>();
      const resquest = https.get(
        url,
        { ...options, signal: abortController.signal },
        (response) => {
          fromListener(response, "data")
            .pipe(takeUntil(onUnsubscribe$))
            .subscribe((data) => {
              subscriber.next(data);
            });

          fromListener(response, "error")
            .pipe(takeUntil(onUnsubscribe$))
            .subscribe((err) => {
              subscriber.error(err);
            });

          fromListener(response, "end")
            .pipe(takeUntil(onUnsubscribe$))
            .subscribe(() => {
              if (!response.complete) {
                subscriber.error(
                  new Error(
                    "The connection was terminated while the message was still being sent"
                  )
                );
              } else {
                subscriber.complete();
              }
            });
        }
      );

      resquest.end();

      return {
        unsubscribe: () => {
          abortController.abort();
          onUnsubscribe$.next();
          onUnsubscribe$.complete();
        },
      };
    });
  }

  progress(url: string | URL, options?: StreamRequestOptions) {
    return new Observable<{ progress: string; chunks: string }>(
      (subscriber) => {
        const abortController = new AbortController();
        const onUnsubscribe$ = new AsyncSubject<void>();
        const request = https.get(
          url,
          {
            ...options,
            method: "GET",
            signal: abortController.signal,
          },
          (response) => {
            let totalByte = 0;
            let currentByte = 0;
            let chunks = "";

            if (options?.effect) {
              response = options.effect(response);
            }

            totalByte = parseInt(response.headers["content-length"] || `0`, 10);

            subscriber.next({
              progress: `0.00`,
              chunks: "",
            });

            fromListener(response, "data")
              .pipe(takeUntil(onUnsubscribe$))
              .subscribe((chunk) => {
                chunks += chunk;
                currentByte += chunk.length;

                subscriber.next({
                  progress: ((currentByte / totalByte) * 100).toFixed(2),
                  chunks: chunks,
                });
              });

            fromListener(response, "end")
              .pipe(takeUntil(onUnsubscribe$))
              .subscribe(() => {
                subscriber.complete();
              });

            fromListener(response, "error")
              .pipe(takeUntil(onUnsubscribe$))
              .subscribe((err) => {
                subscriber.error(err);
              });
          }
        );

        request.end();

        return {
          unsubscribe: () => {
            abortController.abort();
            onUnsubscribe$.next();
            onUnsubscribe$.complete();
          },
        };
      }
    );
  }
}
