import {
  AsyncSubject,
  EMPTY,
  identity,
  MonoTypeOperatorFunction,
  Subject,
} from "rxjs";
import { catchError, filter, mergeMap, takeUntil, tap } from "rxjs/operators";
import ws, { WebSocketServer } from "ws";
import { fromListener } from "../operators/from-listener";
export type WsMessage = [ws.WebSocket, string];
export class WebSocketObservable {
  private readonly clientMessageSubject = new Subject<WsMessage>();
  private readonly serverBoardcastSubject = new Subject<WsMessage>();
  private readonly onClientConnection$ = new Subject<ws.WebSocket>();

  readonly onCloseWebSocket$ = new AsyncSubject<void>();
  readonly onClientSentMessage$ = this.clientMessageSubject.asObservable();
  readonly onServerSentMessage$ = this.serverBoardcastSubject.pipe(
    this.options.serverTransform ?? identity
  );

  constructor(
    public options: {
      port: number;
      serverTransform?: MonoTypeOperatorFunction<WsMessage>;
    }
  ) {
    const webSocketServer = new WebSocketServer({
      port: this.options.port,
    });

    this.onCloseWebSocket$.subscribe(() => {
      webSocketServer.close();
    });

    fromListener<ws.WebSocket>(webSocketServer, "connection")
      .pipe(takeUntil(this.onCloseWebSocket$))
      .subscribe(this.onClientConnection$);

    this.onClientConnection$
      .pipe(
        mergeMap((webSocketClient) => {
          return this.onServerSentMessage$.pipe(
            filter(([client, ms]) => {
              return webSocketClient !== client;
            }),
            tap(([client, msg]) => {
              webSocketClient.send(msg);
            }),
            catchError((err) => {
              console.error(err);
              return EMPTY;
            }),
            takeUntil(this.onClientCloseBrowser(webSocketClient))
          );
        }),
        takeUntil(this.onCloseWebSocket$)
      )
      .subscribe();

    this.onClientConnection$
      .pipe(
        mergeMap((webSocketClient) => {
          return fromListener<ws.RawData>(webSocketClient, "message").pipe(
            tap((message) => {
              this.clientMessageSubject.next([webSocketClient, `${message}`]);
            }),
            takeUntil(this.onClientCloseBrowser(webSocketClient))
          );
        }),
        takeUntil(this.onCloseWebSocket$)
      )
      .subscribe();

    // webSocketServer.on("connection", (webSocketClient) => {
    //   //Server -> Client
    //   const serverMessageSubscription = this.subscribe((message) => {
    //     webSocketClient.send(message);
    //   });

    //   //Client -> Server
    //   webSocketClient.on("message", (message) => {
    //     this.clientMessageSubject.next(`${message}`);
    //   });

    //   //Client close connection
    //   webSocketClient.on("close", () => {
    //     // จะทำงานเมื่อปิด Connection ในตัวอย่างคือ ปิด Browser
    //     serverMessageSubscription.unsubscribe();
    //   });
    // });
  }

  close() {
    this.onCloseWebSocket$.next();
    this.onCloseWebSocket$.complete();
  }

  boardcast(message: WsMessage) {
    this.serverBoardcastSubject.next(message);
  }

  private onClientCloseBrowser(webSocketClient: ws.WebSocket) {
    return fromListener(webSocketClient, "close");
  }
}
