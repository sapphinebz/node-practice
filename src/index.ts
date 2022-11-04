// import "./showcase/server-sent-events.ts/server-sent-events.js";
// import "./showcase/gold-today/gold-today.js";
// import "./showcase/web-socket/web-socket.js";
// import "./showcase/progress-download/progress-download.js";
// import "./showcase/cors-policy/cors-policy.js";
// import "./showcase/drag-drop/drag-drop.js";

import { createWriteStream, createReadStream } from "fs";
import { fromEvent, Observable } from "rxjs";

// import { MongoDBObservable } from "./mongo-database/mongoDB-observable";

// import { AppExpress } from "./express/app-express";

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

// const mongoDB = new MongoDBObservable({
//   url: `mongodb+srv://thanadit:mon032goDB245279@cluster0.yndbzv3.mongodb.net/test`,
// });

// mongoDB.onConnected$.subscribe(() => {
//   console.log("connected");
// });

// Adding a 'data' event handler.
// Calling the stream.resume() method.
// Calling the stream.pipe() method to send the data to a Writable.

// const readStream = createReadStream("package.json");

import http, { RequestOptions } from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { HttpsClient } from "./http/http-client";

// const request = https.get(
//   "https://pokeapi.co/api/v2/pokemon/ditto",
//   (response) => {
//     response.on("data", (data) => {
//       console.log(data);
//     });
//   }
// );

const httpsClient = new HttpsClient();

const writeStream = fs.createWriteStream(path.join(__dirname, "rxjs.pdf"));

httpsClient
  .progress(
    "https://hoclaptrinhdanang.com/downloads/pdf/react/RxJS%20in%20Action.pdf",
    {
      pipeStream: (response) => {
        response.pipe(writeStream);
      },
    }
  )
  .subscribe((response) => {
    console.log(response.progress);
  });

// httpsClient
//   .request({
//     host: "pokeapi.co",
//     path: "/api/v2/pokemon/ditto",
//     method: "GET",
//   })
//   .subscribe((response) => {
//     console.log(response);
//   });

// httpsClient.get("https://pokeapi.co/api/v2/pokemon/ditto").subscribe((data) => {
//   console.log(data);
// });

// https
//   .request(
//     {
//       host: "pokeapi.co",
//       path: "/api/v2/pokemon/ditto",
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     },
//     (response) => {
//       // response.resume();
//       response.on("data", (data) => {
//         console.log(data);
//       });
//       response.on("end", () => {
//         console.log("complete");
//       });
//     }
//   )
//   .end();

// request({
//   host: "https://pokeapi.co/api/v2/pokemon/ditto",
//   method: "GET",
// }).subscribe((data) => {
//   console.log(data);
// });

// function request<T = any>(options: RequestOptions | string | URL) {
//   return new Observable<T>((subscriber) => {
//     const req = https.request(options, (res) => {
//       //   res.resume();
//       res.on("data", (data) => {
//         subscriber.next(data);
//       });
//       res.on("error", (err) => {
//         console.log(err);
//       });
//       res.on("end", () => {
//         // if (!res.complete) {
//         //   subscriber.error(
//         //     new Error(
//         //       "The connection was terminated while the message was still being sent"
//         //     )
//         //   );
//         // } else {
//         //   subscriber.complete();
//         // }
//       });
//     });
//   });
// }
