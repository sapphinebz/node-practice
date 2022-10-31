import { share } from "rxjs/operators";
import { streamHTMLFileToResponse } from "../../http/response/stream-html-file-to-response";
import path from "path";
import {
  httpCreateServer,
  whenRoute,
} from "../../http/server/http-create-server";
import { ServerSentEvent } from "../../server-sent-events/server-sent-event";

const server$ = httpCreateServer({ port: 4200 }).pipe(share());

server$
  .pipe(
    whenRoute({ url: "/", method: "GET" }),
    streamHTMLFileToResponse(
      path.join(process.cwd(), "public", "server-sent-events.html")
    )
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
