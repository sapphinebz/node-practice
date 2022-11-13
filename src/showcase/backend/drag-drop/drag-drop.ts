import express from "express";

import { pipe, ReplaySubject } from "rxjs";
import { map, share } from "rxjs/operators";
import {
  WebSocketObservable,
  WsMessage,
} from "../../../web-socket/web-socket-observable";

const app = express();
app.use(express.static("public"));
app.listen(process.env.PORT || 3000, () => {});

let state = {} as { [alt: string]: string };

const webSocket = new WebSocketObservable({
  port: 4000,
  serverTransform: pipe(
    map(([client, msg]) => {
      const object = JSON.parse(msg);
      state = { ...state, [object.alt]: msg };
      return [client, JSON.stringify(state)] as WsMessage;
    }),
    share({
      connector: () => new ReplaySubject(1),
    })
  ),
});

webSocket.clientMessage$.subscribe((messagePackage) => {
  webSocket.boardcast(messagePackage);
});
