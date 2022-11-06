import { interval } from "rxjs";
import { mergeMap, takeUntil, tap, map, share } from "rxjs/operators";
import { AppExpress } from "../../../express/app-express";
import { fromListener } from "../../../operators/from-listener";

const appExpress = new AppExpress({ port: Number(process.env.PORT) || 3000 });
appExpress
  .get("/")
  .pipe(appExpress.redirectTo("/stream-receivers.html"))
  .subscribe();

appExpress.static("public");

const sender$ = interval(2000).pipe(
  map((i) => `send: ${i}`),
  share()
);

appExpress
  .get("/receive")
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
