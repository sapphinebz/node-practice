import express from "express";
import { FromArduino } from "../../../arduino/from-arduino";
import { fromHttpExpress } from "../../../express/from-http-express";
import { WebSocketObservable } from "../../../web-socket/web-socket-observable";
const app = express();

app.use(express.static("public"));

app.listen(3000, () => {});

const arduino = new FromArduino({
  path: "/dev/cu.usbmodem1101",
  baudRate: 9600,
});

app.get("/list-serial", (request, response) => {
  arduino.serialPort.list().then((value) => {
    response.json(value);
  });
});

const webSocket = new WebSocketObservable({
  port: 4000,
});

webSocket.onClientSentMessage$.subscribe(([client, message]) => {
  const pinValue = JSON.parse(message).msg as any;
  arduino.setPin(13, pinValue);
});

// const pin13$ = fromHttpExpress((handler) => {
//   app.get("/pin13", handler);
// });

// pin13$.subscribe(({ request, response }) => {
//   const pinValue = request.query.value as any;
//   arduino.setPin(13, pinValue);
//   response.json({ success: true });
// });
