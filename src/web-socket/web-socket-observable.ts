import { Observable, ReplaySubject, Subject } from "rxjs";
import { WebSocketServer } from "ws";

export class WebSocketObservable {
  private readonly serverMessageSubject = new ReplaySubject<string>();
  private readonly clientMessageSubject = new Subject<string>();

  webSocketServer!: WebSocketServer;
  readonly clientMessage$ = this.clientMessageSubject.asObservable();

  constructor(public options: { port: number }) {
    this.webSocketServer = new WebSocketServer({
      port: this.options.port,
    });

    this.webSocketServer.on("connection", (webSocketClient) => {
      //Server -> Client
      const serverMessageSubscription = this.serverMessageSubject.subscribe(
        (message) => {
          webSocketClient.send(message);
        }
      );

      //Client -> Server
      webSocketClient.on("message", (message) => {
        this.clientMessageSubject.next(`${message}`);
      });

      //Client close connection
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
