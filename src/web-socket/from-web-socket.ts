import { merge, Observable, Subject } from "rxjs";
import { mergeMap, share, takeUntil, tap } from "rxjs/operators";
import ws, { WebSocketServer } from "ws";
import { fromListener } from "../operators/from-listener";

export class FromWebSocket extends Subject<string> {
  readonly receive$ = new Subject<string>();

  webSocketServer = new WebSocketServer({
    port: this.options.port,
  });

  onClientConnect$: Observable<ws.WebSocket> = fromListener<ws.WebSocket>(
    this.webSocketServer,
    "connection"
  ).pipe(share());

  constructor(public options: { port: number }) {
    super();

    this.onClientConnect$
      .pipe(
        mergeMap((client) => {
          const clientReceive$ = this.pipe(
            tap((message) => {
              client.send(message);
            })
          );

          const serverReceive$ = fromListener<ws.RawData>(
            client,
            "message"
          ).pipe(
            tap((message) => {
              this.receive$.next(message);
            })
          );

          return merge(serverReceive$, clientReceive$).pipe(
            takeUntil(this.onClientCloseBrowser(client))
          );
        })
      )
      .subscribe();
  }

  boardcast(message: string) {
    // this.boardcastMessage$.next(message);
    this.next(message);
  }

  private onClientCloseBrowser(webSocketClient: ws.WebSocket) {
    return fromListener(webSocketClient, "close");
  }
}
