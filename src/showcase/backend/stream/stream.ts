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

const app = express();

app.use(express.static("public"));

app.listen(3000, () => {});

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
