import {
  AsyncSubject,
  EMPTY,
  identity,
  MonoTypeOperatorFunction,
  ReplaySubject,
  Subject,
} from "rxjs";
import {
  catchError,
  filter,
  mergeMap,
  share,
  takeUntil,
  tap,
} from "rxjs/operators";
import ws, { WebSocketServer } from "ws";
import { fromListener } from "../operators/from-listener";
export type WsMessage = [ws.WebSocket, string];
export class WebSocketObservable {
  private readonly clientMessageSubject = new Subject<WsMessage>();
  private readonly onClose$ = new AsyncSubject<void>();
  private readonly serverBoardcastSubject = new Subject<WsMessage>();
  readonly clientMessage$ = this.clientMessageSubject.asObservable();
  readonly serverMessage$ = this.serverBoardcastSubject.pipe(
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

    this.onClose$.subscribe(() => {
      webSocketServer.close();
    });

    const connection$ = fromListener<ws.WebSocket>(
      webSocketServer,
      "connection"
    ).pipe(share());

    connection$
      .pipe(
        mergeMap((webSocketClient) => {
          return this.serverMessage$.pipe(
            this.ignoreClientItself(webSocketClient),
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
        takeUntil(this.onClose$)
      )
      .subscribe();

    connection$
      .pipe(
        mergeMap((webSocketClient) => {
          return fromListener<ws.RawData>(webSocketClient, "message").pipe(
            tap((message) => {
              this.clientMessageSubject.next([webSocketClient, `${message}`]);
            }),
            takeUntil(this.onClientCloseBrowser(webSocketClient))
          );
        }),
        takeUntil(this.onClose$)
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
    this.onClose$.next();
    this.onClose$.complete();
  }

  boardcast(message: WsMessage) {
    this.serverBoardcastSubject.next(message);
  }

  private onClientCloseBrowser(webSocketClient: ws.WebSocket) {
    return fromListener(webSocketClient, "close");
  }

  private ignoreClientItself(
    webSocketClient: ws.WebSocket
  ): MonoTypeOperatorFunction<WsMessage> {
    return filter((message) => {
      const [client, _] = message;
      return client !== webSocketClient;
    });
  }
}
