// import { Readable, Transform, Writable } from "stream";
// import fs from "fs";
// import { interval, map, take } from "rxjs";

// import { FromDirectory } from "./file/folder/from-directory";
// import { fromArgs } from "./stdin/from-args";
// import { fromCmdInput } from "./stdin/from-cmd-input";
// import { fromStdInputQuestionList } from "./stdin/from-std-input-question-list";

// import { Subject, throttleTime } from "rxjs";
// import { Duplex, PassThrough } from "stream";

// import "./showcase/backend/upload-file/upload-file.js";
// import "./showcase/backend/cors-policy/cors-policy.js";
// import "./showcase/backend/stream/stream.js";
// import "./showcase/backend/progress-download/progress-download.js";
// import "./showcase/backend/json-database/json-database.js";
// import "./showcase/backend/drag-drop/drag-drop.js";
import "./showcase/backend/arduino/arduino.js";

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

// ย่อรูปด้วย sharp
// const sharp = require('sharp')
// await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toFile(__dirname + `/images/${req.file.originalname}`)

// const appExpress = new AppExpress({ port: 3000 });
// appExpress.static("public");

// var post_options = {
//     host: 'closure-compiler.appspot.com',
//     port: '80',
//     path: '/compile',
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'Content-Length': Buffer.byteLength(post_data)
//     }
// };

// app.use('/api/images', express.static('images'))

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const db = require('../models');
// const constants = require('../constants/constants');

// router.post('/login', async (req, res)=>{
//     try {
//         const { username, password } = req.body;
//         const user = await db.Users.findOne({ where : { username : username}})
//         if (user) {
//             if (bcrypt.compareSync(password, user.password)) {
//                 res.status(201).json({ result : constants.kResultOk, message : JSON.stringify(user)})
//             } else {
//                 res.status(404).json({ result : constants.kResultNok, message : 'password incorrect' })
//             }
//         } else {
//             res.status(404).json({ result : constants.kResultNok, message : 'username not found' })
//         }
//     } catch (error) {
//         res.status(500).json({result : constants.kResultNok, message : error.message });
//     }
// })

// router.post('/register', async (req, res)=>{

//     req.body.password = bcrypt.hashSync(req.body.password, 8);

//     const data = {
//         ...req.body
//     }

//     try {

//         const result = await db.Users.findOne({
//             where: {
//                 'username': req.body.username
//             }
//         });

//         if(!result) {
//             const user = await db.Users.create(data);
//             res.status(201).json({result : constants.kResultOk, user});
//         } else {
//             res.status(409).json({ message : 'an existing registered username' })
//         }

//     } catch (error) {
//         res.status(500).json({result : constants.kResultNok, message : error.message });
//     }

// })

// module.exports = router;

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
//     });

// const transform = new Transform({
//   encoding: "utf-8",
//   transform(chunk: string, encoding, next) {
//     this.push(`${chunk}`.replace("data:", "repeat:"));
//     setTimeout(() => {
//       next();
//     }, 1000);
//   },
// });

// async function* generateDelay(delay: number) {
//   console.log("create");
//   let i = 1;
//   const _delay = () =>
//     new Promise<void>((resolve) => {
//       setTimeout(() => {
//         resolve();
//       }, delay);
//     });
//   while (i <= 10) {
//     await _delay();
//     yield `data:${i++}`;
//   }
// }
// const readableStream = Readable.from(generateDelay(1000));

// readableStream.pipe(transform);
// transform.on("data", (data) => {
//   console.log(data);
// });

// process.stdin.pipe();

// arduino.setPin(13, "H");

// setTimeout(() => {
//   arduino.setPin(13, "L");
// }, 2000);

// interval(1000)
//   .pipe(scan((high) => !high, false))
//   .subscribe((isHigh) => {
//     arduino.setPin(13, isHigh ? "H" : "L");

//     arduino.readPin(2);
//   });

// arduino.data$.subscribe(console.log);

// interval(1000).subscribe(() => {
//   arduino.readPin(2);
// });

// arduino.data$.subscribe(console.log);

// arduino.readPin(2).subscribe((data) => {
//   console.log(data);
// });
