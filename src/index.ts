import { share, switchMap, tap } from "rxjs/operators";
import { responseHTML } from "./http/response/response-html";
import { responsePlainText } from "./http/response/response-plain-text";
import { httpCreateServer, whenRoute } from "./http/server/http-create-server";
import { readStreamFile } from "./read-file/read-stream-file";
import { ServerSentEvent } from "./server-sent-events/server-sent-event";
import { WebSocketObservable } from "./web-socket/web-socket-observable";

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

const socket$ = new WebSocketObservable({ port: 4000 });
socket$.subscribe((message) => {
  socket$.boardcast(`${message}`);
});

const serverSentEvents = new ServerSentEvent<string>(
  server$.pipe(
    whenRoute({
      url: "/events",
      method: "GET",
    })
  )
);

setInterval(() => {
  serverSentEvents.boardcast(`Hello`);
}, 1000);

const serverSentEventsPage$ = readStreamFile(
  `${process.cwd()}/public/server-sent-events.html`
);

server$
  .pipe(
    whenRoute({
      url: "/server_sent_events",
      method: "GET",
    }),
    switchMap((client) => {
      return serverSentEventsPage$.pipe(
        tap((html) => {
          responseHTML(client.response, html as string);
        })
      );
    })
  )
  .subscribe();
