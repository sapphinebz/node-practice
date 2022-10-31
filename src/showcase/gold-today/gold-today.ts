import { interval } from "rxjs";
import { exhaustMap, map, share } from "rxjs/operators";
import path from "path";
import { streamHTMLFileToResponse } from "../../http/response/stream-html-file-to-response";
import {
  httpCreateServer,
  whenRoute,
} from "../../http/server/http-create-server";
import { httpGet } from "../../http/server/http-get";
import { ServerSentEvent } from "../../server-sent-events/server-sent-event";

const server$ = httpCreateServer({ port: 4200 }).pipe(share());

server$
  .pipe(
    whenRoute({
      url: "/",
      method: "GET",
    }),
    streamHTMLFileToResponse(
      path.join(process.cwd(), "public", "gold-today.html")
    )
  )
  .subscribe();

const serverSentEvent$ = new ServerSentEvent(
  server$.pipe(
    whenRoute({
      url: "/fetch-gold",
      method: "GET",
    })
  )
);

interval(5000)
  .pipe(
    exhaustMap(() => {
      return httpGet<string>(`https://www.goldtraders.or.th/`).pipe(
        map((chunks) => {
          // const index = chunks.search(
          //   /\<table[^>]+id=\"DetailPlace_MainGridView\"[^\>]+\>/
          // );
          // let content = chunks.substring(index, chunks.length);
          // const indexCloseTable = content.search(/\<\/table\>/);
          // content = content.substring(0, indexCloseTable + 8);

          serverSentEvent$.boardcast(chunks);
        })
      );
    })
  )
  .subscribe();
