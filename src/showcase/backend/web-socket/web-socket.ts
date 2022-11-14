import express from "express";
import { pipe } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { WebSocketObservable } from "../../../web-socket/web-socket-observable";

const app = express();
app.use(express.static("public"));
app.listen(3000, () => {});

const webSocket = new WebSocketObservable({
  port: 4000,
  serverTransform: pipe(
    shareReplay({
      bufferSize: Infinity,
      refCount: true,
    })
  ),
});

webSocket.onClientSentMessage$.subscribe((messagePackage) => {
  webSocket.boardcast(messagePackage);
});
