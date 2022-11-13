import express from "express";
import { timer } from "rxjs";
import { share } from "rxjs/operators";
import { fromHttpExpress } from "../../../express/from-http-express";
import { ServerSentEvent } from "../../../server-sent-events/server-sent-event";

const app = express();
app.use(express.static("public"));
app.listen(3000, () => {});

const event$ = fromHttpExpress((handler) => {
  app.get("/events", handler);
}).pipe(share());

const serverSentEvents$ = new ServerSentEvent(event$);

timer(0, getRandomArbitrary(2500, 5000)).subscribe((value) => {
  serverSentEvents$.boardcast(`${value}`);
});

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
