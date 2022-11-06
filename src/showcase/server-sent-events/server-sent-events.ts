import { timer } from "rxjs";
import { AppExpress } from "../../express/app-express";
import { ServerSentEvent } from "../../server-sent-events/server-sent-event";

const apiExpress = new AppExpress({ port: 3000 });
apiExpress.static("public");

const serverSentEvents$ = new ServerSentEvent(apiExpress.get("/events"));

timer(0, getRandomArbitrary(2500, 5000)).subscribe((value) => {
  serverSentEvents$.boardcast(`${value}`);
});

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
