import { share } from "rxjs/operators";
import { readStreamAndResponseHTML } from "../../http/response/response-html";
import {
  httpCreateServer,
  whenRoute,
} from "../../http/server/http-create-server";
import { ServerSentEvent } from "../../server-sent-events/server-sent-event";

const server$ = httpCreateServer({ port: 4200 }).pipe(share());

server$
  .pipe(
    whenRoute({ url: "/", method: "GET" }),
    readStreamAndResponseHTML(`${process.cwd()}/public/server-sent-events.html`)
  )
  .subscribe();

const serverSentEvents$ = new ServerSentEvent(
  server$.pipe(
    whenRoute({
      url: "/events",
      method: "GET",
    })
  )
);

let i = 0;
setInterval(() => {
  serverSentEvents$.boardcast(`Hello: ${i++}`);
}, 1000);
