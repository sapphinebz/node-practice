import { bindCallback, Observable, Subject, takeUntil } from "rxjs";
import { ClientMessage } from "../http/server/http-create-server";

export class ServerSentEvent<T> {
  serverSent$ = new Subject<T>();
  constructor(public client$: Observable<ClientMessage>) {
    client$.subscribe(({ request, response }) => {
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      response.write("test");

      const fromListener = bindCallback(request.addListener);

      this.serverSent$
        .pipe(takeUntil(fromListener("close")))
        .subscribe((message) => {
          response.write(message);
        });
    });
  }

  boardcast(message: T) {
    this.serverSent$.next(message);
  }
}
