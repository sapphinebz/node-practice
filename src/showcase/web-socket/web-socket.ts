import { share, switchMap, tap } from "rxjs/operators";
import { responseHTML } from "../../http/response/response-html";
import {
  httpCreateServer,
  whenRoute,
} from "../../http/server/http-create-server";
import { readStreamFile } from "../../read-file/read-stream-file";
import { WebSocketObservable } from "../../web-socket/web-socket-observable";

const server$ = httpCreateServer({ port: 4200 }).pipe(share());

const webSocketPage$ = readStreamFile(
  `${process.cwd()}/public/web-socket.html`
);

server$
  .pipe(
    whenRoute({
      url: "/",
      method: "GET",
    }),
    switchMap((client) => {
      return webSocketPage$.pipe(
        tap((html) => {
          responseHTML(client.response, html as string);
        })
      );
    })
  )
  .subscribe();

const webSocket = new WebSocketObservable({ port: 4000 });
webSocket.clientMessage$.subscribe((message) => {
  webSocket.boardcast(`${message}`);
});
