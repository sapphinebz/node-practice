import express from "express";
import { EMPTY, interval, merge } from "rxjs";
import {
  catchError,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from "rxjs/operators";
import SerialPort from "serialport";
import { FromArduino } from "../../../arduino/from-arduino";
import { fromHttpExpress } from "../../../express/from-http-express";
import { FromWebSocket } from "../../../web-socket/from-web-socket";
const app = express();

app.use(express.static("public"));

app.listen(3000, () => {});

const webSocket = new FromWebSocket({
  port: 4000,
});

app.get("/list-serial", (request, response) => {
  SerialPort.list().then((value) => {
    response.json(value);
  });
});

const connect$ = fromHttpExpress((handler) => {
  app.get("/connect", handler);
});

connect$
  .pipe(
    switchMap(({ request, response }) => {
      const path = request.query.path as string;

      const arduino = new FromArduino({
        path: path,
        baudRate: 9600,
      });

      return arduino.onOpen$.pipe(
        finalize(() => {
          arduino.end();
        }),
        switchMap(() => {
          response.json({ success: true });
          const arduinoReceive$ = webSocket.receive$.pipe(
            tap((message) => {
              const pinValue = JSON.parse(message).msg as any;
              arduino.setPin(13, pinValue);
            })
          );

          const read$ = interval(500).pipe(
            tap(() => {
              arduino.readPin(2);
            })
          );

          const arduinoSend$ = arduino.data$.pipe(
            distinctUntilChanged(),
            tap((data) => {
              //   console.log(data);
              webSocket.boardcast(data);
            })
          );

          return merge(arduinoReceive$, arduinoSend$, read$);
        }),
        catchError((err) => {
          response.status(5000).send({ error: err });
          return EMPTY;
        })
      );
    })
  )
  .subscribe();
