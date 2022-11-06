import { pipe } from "rxjs";
import { shareReplay } from "rxjs/operators";
import { AppExpress } from "../../../express/app-express";
import { WebSocketObservable } from "../../../web-socket/web-socket-observable";
// import {
//   httpCreateServer,
//   whenRoute,
// } from "../../http/server/http-create-server";

const apiExpress = new AppExpress({ port: 3000 });
apiExpress.static("public");

// const apiServer = new HttpCreateServer({
//   port: 3000,
// });

// const server$ = httpCreateServer({ port: 4200 }).pipe(share());

// const webSocketPage$ = readStreamFile(
//   `${process.cwd()}/public/web-socket.html`
// );

// apiServer
//   .get("/")
//   .pipe(
//     mergeMap(({ response }) => {
//       return webSocketPage$.pipe(
//         tap((html) => {
//           response.writeHead(200, { ...Header.HTML });
//           response.write(html);
//           response.end();
//         })
//       );
//     })
//   )
//   .subscribe();

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
