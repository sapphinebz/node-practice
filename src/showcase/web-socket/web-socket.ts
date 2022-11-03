import { pipe } from "rxjs";
import { share, mergeMap, tap, shareReplay } from "rxjs/operators";
import { Header } from "../../http/header/header";
import { HttpCreateServer } from "../../http/server/http-create-server";
// import {
//   httpCreateServer,
//   whenRoute,
// } from "../../http/server/http-create-server";
import { readStreamFile } from "../../read-file/read-stream-file";
import { WebSocketObservable } from "../../web-socket/web-socket-observable";

const apiServer = new HttpCreateServer({
  port: 4200,
});

// const server$ = httpCreateServer({ port: 4200 }).pipe(share());

const webSocketPage$ = readStreamFile(
  `${process.cwd()}/public/web-socket.html`
);

apiServer
  .get("/")
  .pipe(
    mergeMap(({ response }) => {
      return webSocketPage$.pipe(
        tap((html) => {
          response.writeHead(200, { ...Header.HTML });
          response.write(html);
          response.end();
        })
      );
    })
  )
  .subscribe();

const webSocket = new WebSocketObservable({
  port: 4000,
  serverTransform: pipe(
    shareReplay({
      bufferSize: Infinity,
      refCount: true,
    })
  ),
});

webSocket.clientMessage$.subscribe((messagePackage) => {
  webSocket.boardcast(messagePackage);
});
