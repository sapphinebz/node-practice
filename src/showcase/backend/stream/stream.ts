import { connectable, interval, Subject } from "rxjs";
import {
  concatMap,
  map,
  mergeMap,
  share,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
} from "rxjs/operators";
import { fromListener } from "../../../operators/from-listener";

import express from "express";
import { fromHttpExpress } from "../../../express/from-http-express";
import { fromCmdInput } from "../../../stdin/from-cmd-input";
import { ClientRequestHttp } from "../../../express/app-express";
import { Duplex } from "stream";
import { writeStreamDuplex } from "../../../stream/write-stream-duplex";
import { transferStream } from "../../../operators/transfer-stream";

const app = express();

app.use(express.static("public"));

app.listen(3000, () => {});

const news$ = new Subject<ClientRequestHttp>();
app.get("/news", (request, response) => {
  news$.next({ request, response });
});

news$.subscribe(({ request, response }) => {
  const duplex = writeStreamDuplex();

  interval(1000)
    .pipe(
      take(10),
      map((i) => `write-${i}`),
      transferStream(duplex)
    )
    .subscribe();

  response.status(200);
  response.set("Content-Type", "text/plain");

  duplex.pipe(response);
});

const client$ = connectable(
  fromHttpExpress((handler) => {
    app.get("/subscribe", handler);
  }),
  { connector: () => new Subject() }
);

client$.connect();

client$
  .pipe(
    switchMap((client) => {
      const { request, response } = client;

      console.log("begin client:");
      response.status(200);
      response.set("Content-Type", "text/plain");
      return fromCmdInput().pipe(
        takeWhile((text) => {
          return text.trim() !== "end";
        }),
        tap({
          next: (msg) => {
            console.log("send to client:", msg);
            response.write(msg);
          },
          complete: () => {
            console.log("end connection to client!");
            response.end();
          },
          unsubscribe: () => {
            console.log("disconnect client!");
            response.end();
          },
        }),
        takeUntil(fromListener(request, "close"))
      );
    })
  )
  .subscribe();
