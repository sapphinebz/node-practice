// import "./showcase/server-sent-events.ts/server-sent-events.js";
// import "./showcase/gold-today/gold-today.js";
// import "./showcase/web-socket/web-socket.js";
// import "./showcase/progress-download/progress-download.js";
// import "./showcase/cors-policy/cors-policy.js";
// import "./showcase/drag-drop/drag-drop.js";

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
