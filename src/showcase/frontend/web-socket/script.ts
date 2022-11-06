import { fromEvent, merge, Subject } from "rxjs";
import { filter, map } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";

const channelEl = document.querySelector<HTMLInputElement>("[data-name]")!;
const messageEl = document.querySelector<HTMLElement>(`[data-message]`)!;
const messagerEl = document.querySelector<HTMLInputElement>("[data-messager]")!;
const sendEl = document.querySelector("[data-send]")!;

const myMessage$ = new Subject<{ channel: string; msg: string }>();

const subject = webSocket({
  url: "ws://localhost:4000",
  deserializer: ({ data }) => data,
  serializer: (msg) => {
    return JSON.stringify({ channel: channelEl.value, msg: msg });
  },
  openObserver: {
    next: () => {
      // open connection client -> server

      const click$ = fromEvent(sendEl, "click");
      const enter$ = fromEvent<KeyboardEvent>(messagerEl, "keydown").pipe(
        filter((event) => event.key === "Enter")
      );

      merge(click$, enter$).subscribe(() => {
        console.log(messagerEl);
        myMessage$.next({ channel: channelEl.value, msg: messagerEl.value });
        subject.next(messagerEl.value);
        messagerEl.value = "";
      });
    },
  },
});

const messageFromServer$ = subject.pipe(
  map((serverMessage) => {
    const message = JSON.parse(serverMessage);
    return { channel: message.channel, msg: message.msg };
  })
);

merge(messageFromServer$, myMessage$).subscribe((message) => {
  const divEl = document.createElement("div");
  divEl.innerText = `${message.channel}: ${message.msg}`;
  messageEl.appendChild(divEl);
});

// const connection = new WebSocket("ws://localhost:4000");
// connection.onopen = function () {
//   // จะทำงานเมื่อเชื่อมต่อสำเร็จ
//   console.log("connect webSocket");
//   connection.send("Hello ABCDEF"); // ส่ง Data ไปที่ Server
// };
// connection.onerror = function (error) {
//   console.error("WebSocket Error " + error);
// };
// connection.onmessage = function (e) {
//   // log ค่าที่ถูกส่งมาจาก server
//   console.log("message from server: ", e.data);
// };
