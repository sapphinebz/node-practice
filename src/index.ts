import { tap } from "rxjs/operators";
import { responseCors } from "./http/response/response-cors";
import { sendJsonToServer } from "./http/response/send-json-to-response";
import { sendPlainTextToResponse } from "./http/response/send-plain-text-to-response";
import { streamHTMLFileToResponse } from "./http/response/stream-html-file-to-response";
import { httpCreateServer, whenRoute } from "./http/server/http-create-server";
// import "./showcase/server-sent-events.ts/server-sent-events.js";
// import "./showcase/gold-today/gold-today.js";
// import "./showcase/web-socket/web-socket.js";
// import "./showcase/progress-download/progress-download.js";

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

//request จาก client มาแบบมี Access-Control-Allow-Credentials จะบอกให้ server เปิดเผย  response ให้กับ frontend code ด้วยนะ

// ใช้ XMLHttpRquest XMLHttpRequest.withCredentials
// หรือ Request แบบกำหนด credentials เป็น true

// https://www.npmjs.com/package/googleapis
// https://developers.google.com/sheets/api/quickstart/nodejs

const frontendServer$ = httpCreateServer({ port: 4200 });

frontendServer$
  .pipe(
    whenRoute({ method: "GET", url: "/" }),
    streamHTMLFileToResponse(`${process.cwd()}/public/cors-policy.html`)
  )
  .subscribe();

const apiServer$ = httpCreateServer({ port: 3000 });
apiServer$
  .pipe(
    whenRoute({
      method: "GET",
      url: "/",
    }),
    sendPlainTextToResponse("Hello 3000 /")
  )
  .subscribe();

apiServer$
  .pipe(
    whenRoute({
      method: "OPTIONS",
      url: "/api",
    }),
    tap(({ request, response }) => {
      // const origin = request.headers["Access-Control-Allow-Origin"];
      // console.log("---header", request.headers);
      // console.log("---origin", request.headers["origin"]);
      // const origin = request.headers["origin"];
      // 204 no content
      response.writeHead(204, {
        // "Access-Control-Allow-Origin": "http://localhost:4200",
        // "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Origin": "http://localhost:4200",
        "Access-Control-Allow-Headers":
          "access-control-allow-origin,Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      });
      response.end();
    })
  )
  .subscribe();

apiServer$
  .pipe(
    whenRoute({
      method: "GET",
      url: "/api",
    }),
    tap(({ response }) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:4200",
      });
      response.end(
        JSON.stringify({
          results: [
            {
              employeeId: 1,
              employeeName: "Thanadit",
            },
            {
              employeeId: 2,
              employeeName: "Buthong",
            },
          ],
        })
      );
    })
  )
  .subscribe();
