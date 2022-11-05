// import "./showcase/server-sent-events/server-sent-events.js";
// import "./showcase/gold-today/gold-today.js";
// import "./showcase/web-socket/web-socket.js";
// import "./showcase/progress-download/progress-download.js";
// import "./showcase/cors-policy/cors-policy.js";
// import "./showcase/drag-drop/drag-drop.js";
// import "./showcase/stream-receivers/stream-receivers.js";
// import "./showcase/upload-file/upload-file.js";
// const issue2options = {
//   origin: true,
//   methods: ["POST"],
//   credentials: true,
//   maxAge: 3600
// };

// สำหรับ CORS
//ต้องทั้ง client และ server เซ็ต credentials เป็น true
// เหมือนจะให้ expose อะไรสักอย่าง

// credentials ก็คือพวก Credentials are cookies, authorization headers, or TLS client certificates.

// request จาก client มาแบบมี Access-Control-Allow-Credentials จะบอกให้ server เปิดเผย  response ให้กับ frontend code ด้วยนะ

// ใช้ XMLHttpRquest XMLHttpRequest.withCredentials
// หรือ Request แบบกำหนด credentials เป็น true

// https://www.npmjs.com/package/googleapis
// https://developers.google.com/sheets/api/quickstart/nodejs

// Readable streams which have emitted 'end' or 'close'.
// Writable streams which have emitted 'finish' or 'close'.

// Adding a 'data' event handler.
// Calling the stream.resume() method.
// Calling the stream.pipe() method to send the data to a Writable.

// retry ในแบบ stream แหละ จะเริ่ม stream ใหม่ตั้งแต่ต้น
// writer.once('drain', write);

// const zlib = require('node:zlib');
// import zlib from 'zlib';

import fs from "fs";
import { takeUntil, timer } from "rxjs";
import { fromWritable } from "./operators/from-writable";
const writeStream = fs.createWriteStream(__dirname + "/text.txt");

setTimeout(() => {
  writeStream.write("Hello");
  writeStream.end();
}, 5000);

fromWritable(writeStream)
  .pipe(takeUntil(timer(2000)))
  .subscribe((value) => {
    console.log("complete write");
  });
