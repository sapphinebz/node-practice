import { Observable, ReplaySubject, Subject } from "rxjs";
import { WebSocketServer } from "ws";

export class WebSocketObservable extends Observable<string> {
  private readonly serverMessageSubject = new ReplaySubject<string>();
  private readonly clientMessageSubject = new Subject<string>();

  webSocketServer!: WebSocketServer;
  readonly clientMessage$ = this.clientMessageSubject.asObservable();

  constructor(public options: { port: number }) {
    super((subscriber) => {
      return this.clientMessageSubject.subscribe(subscriber);
    });

    this.webSocketServer = new WebSocketServer({
      port: this.options.port,
    });

    this.webSocketServer.on("connection", (webSocketClient) => {
      const serverMessageSubscription = this.serverMessageSubject.subscribe(
        (message) => {
          webSocketClient.send(message);
        }
      );
      webSocketClient.on("message", (message) => {
        this.clientMessageSubject.next(`${message}`);
      });

      webSocketClient.on("close", () => {
        // จะทำงานเมื่อปิด Connection ในตัวอย่างคือ ปิด Browser
        serverMessageSubscription.unsubscribe();
      });
    });
  }

  close() {
    this.webSocketServer.close();
  }

  boardcast(message: string) {
    this.serverMessageSubject.next(message);
  }
}
