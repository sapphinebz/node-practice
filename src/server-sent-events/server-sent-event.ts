import { AsyncSubject, Observable, Subject } from "rxjs";
import { mergeMap, takeUntil, tap } from "rxjs/operators";
import { ClientMessage } from "../http/server/http-create-server";
import { fromListener } from "../operators/from-listener";

// server ส่งไป client ทางเดียว
export class ServerSentEvent<T = any> extends Subject<T> {
  readonly onClose$ = new AsyncSubject<void>();

  constructor(public serverWithRoute$: Observable<ClientMessage>) {
    super();
    this.serverWithRoute$
      .pipe(
        tap(({ request, response }) => {
          response.writeHead(200, {
            "Content-Type": "text/event-stream",
            // Connection: "keep-alive",
            ...(request.httpVersionMajor === 1 && { Connection: "keep-alive" }),
            "Cache-Control": "no-cache",
          });
        }),
        takeUntil(this.onClose$)
      )
      .subscribe();

    this.serverWithRoute$
      .pipe(
        mergeMap(({ request, response }) => {
          // client close browser
          const clientClose$ = fromListener(request, "close");

          return this.pipe(takeUntil(clientClose$)).pipe(
            tap((message) => {
              // const id = Date.now();
              // response.write(`id:${id}\ndata: ${JSON.stringify({ message })}\n\n`);
              response.write(`data: ${JSON.stringify({ message })}\n\n`);
            })
          );
        }),
        takeUntil(this.onClose$)
      )
      .subscribe();
  }

  boardcast(message: T) {
    // this.serverSent$.next(message);
    this.next(message);
  }

  close() {
    this.onClose$.next();
    this.onClose$.complete();
  }
}
