import { AsyncSubject, Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ClientMessage } from "../http/server/http-create-server";
import { fromListener } from "../operators/from-listener";

// server ส่งไป client ทางเดียว
export class ServerSentEvent<T = any> {
  onDestroy$ = new AsyncSubject<void>();
  serverSent$ = new Subject<T>();

  constructor(public serverWithRoute$: Observable<ClientMessage>) {
    this.serverWithRoute$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(({ request, response }) => {
        response.writeHead(200, {
          "Content-Type": "text/event-stream",
          // Connection: "keep-alive",
          ...(request.httpVersionMajor === 1 && { Connection: "keep-alive" }),
          "Cache-Control": "no-cache",
        });

        const clientClose$ = fromListener(request, "close");

        this.serverSent$.pipe(takeUntil(clientClose$)).subscribe((message) => {
          // const id = Date.now();
          // response.write(`id:${id}\ndata: ${JSON.stringify({ message })}\n\n`);
          response.write(`data: ${JSON.stringify({ message })}\n\n`);
        });
      });
  }

  boardcast(message: T) {
    this.serverSent$.next(message);
  }

  complete() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
