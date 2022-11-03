import { share } from "rxjs/operators";
import { streamHTMLFileToResponse } from "../../http/response/stream-html-file-to-response";
import path from "path";
// import {
//   httpCreateServer,
//   whenRoute,
// } from "../../http/server/http-create-server";
import { ServerSentEvent } from "../../server-sent-events/server-sent-event";
import { HttpCreateServer } from "../../http/server/http-create-server";
import { timer } from "rxjs";

const apiServer = new HttpCreateServer({ port: 4200 });

apiServer
  .get("/")
  .pipe(
    streamHTMLFileToResponse(
      path.join(process.cwd(), "public", "server-sent-events.html")
    )
  )
  .subscribe();

apiServer.static("public").subscribe();

const serverSentEvents$ = new ServerSentEvent(apiServer.get("/events"));

timer(0, getRandomArbitrary(2500, 5000)).subscribe((value) => {
  serverSentEvents$.boardcast(`${value}`);
});

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
