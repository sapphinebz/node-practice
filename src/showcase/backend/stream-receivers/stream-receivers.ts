import { interval } from "rxjs";
import { map, mergeMap, share, takeUntil, tap } from "rxjs/operators";
import { fromListener } from "../../../operators/from-listener";

import express from "express";
import { fromHttpExpress } from "../../../express/from-http-express";

const app = express();

app.use(express.static("public"));

app.listen(process.env.PORT || 3000, () => {});

app.get("/", (request, response) => {
  response.redirect("/stream-receivers.html");
});

const receive$ = fromHttpExpress((handler) => {
  app.get("/receive", handler);
});

const sender$ = interval(2000).pipe(
  map((i) => `send: ${i}`),
  share()
);

receive$
  .pipe(
    mergeMap(({ request, response }) => {
      response.status(200);
      response.set("Content-Type", "text/plain");
      return sender$.pipe(
        tap({
          next: (message) => {
            response.write(message);
          },
          complete: () => {
            response.end();
          },
        }),
        takeUntil(fromListener(response, "close"))
      );
    })
  )
  .subscribe();
