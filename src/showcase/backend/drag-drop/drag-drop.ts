import path from "path";

import { pipe, ReplaySubject } from "rxjs";
import { map, share } from "rxjs/operators";
import { AppExpress } from "../../../express/app-express";
import {
  WebSocketObservable,
  WsMessage,
} from "../../../web-socket/web-socket-observable";

const apiExpress = new AppExpress({ port: 3000 });
apiExpress.get("/").subscribe(({ response }) => {
  response.sendFile(path.join(process.cwd(), "public", "drag-drop.html"));
});
apiExpress.static("public");

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
