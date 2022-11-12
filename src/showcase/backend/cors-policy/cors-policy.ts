import path from "path";
import { tap } from "rxjs/operators";
import { HttpCreateServer } from "../../../http/server/http-create-server";

import express from "express";
import { formDataToBody } from "../../../express/middlewares/form-data-to-body";
import { optionsEnableCors } from "../../../express/middlewares/options-enable-cors";
import { allowOrigin } from "../../../express/middlewares/allow-origin";
import { formDataFileUpload } from "../../../express/middlewares/form-data-file-upload";

const FRONT_END_ORIGIN = "http://localhost:4200";

const frontend = express();
frontend.listen(4200, () => {});
frontend.use(express.static("public"));

const backend = express();
backend.listen(3000, () => {});
backend.use(express.static("public"));

backend.options("/api", optionsEnableCors(FRONT_END_ORIGIN));

backend.get("/api", allowOrigin(FRONT_END_ORIGIN), (request, response) => {
  response.writeHead(200, {
    "Content-Type": "application/json",
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
});

backend.post(
  "/api",
  express.json(),
  allowOrigin(FRONT_END_ORIGIN),
  (request, response) => {
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        serverReceived: request.body,
      })
    );
  }
);

backend.options("/form-data-no-file", optionsEnableCors(FRONT_END_ORIGIN));

backend.post(
  "/form-data-no-file",
  formDataToBody(),
  allowOrigin(FRONT_END_ORIGIN),
  (request, response) => {
    const formData = request.body;
    console.log(formData);
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        serverReceived: formData,
      })
    );
  }
);

backend.options("/api-form-data", optionsEnableCors(FRONT_END_ORIGIN));

backend.post(
  "/api-form-data",
  formDataFileUpload({
    filePath: ({ fieldname, file, info, request }) => {
      return path.join(__dirname, "uploads", info.filename);
    },
    formDataToBody: true,
  }),
  allowOrigin(FRONT_END_ORIGIN),
  (request, response) => {
    const formData = request.body;
    console.log(formData);
    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        serverReceived: formData,
      })
    );
  }
);

backend.options("/expose-headers", optionsEnableCors(FRONT_END_ORIGIN));

backend.get(
  "/expose-headers",
  allowOrigin(FRONT_END_ORIGIN),
  (request, response) => {
    // ถ้า client คนละ origin กับ server บาง headers จะถูกปิดไม่ให้มองเห็นที่ browsers
    // วิธีเปิดให้ client มองเห็น headers ให้ใส่ Access-Control-Expose-Headers
    // บาง headers จะถูกเปิดให้เห็นปกติ
    // cache-control, content-language, content-length, content-type, expires, last_modified, pragma
    response.set("Access-Control-Expose-Headers", "*");
    response.json({
      result: true,
    });
  }
);

// const frontendServer = new HttpCreateServer({ port: 4200 });

// frontendServer.static("public").subscribe();

// const apiServer = new HttpCreateServer({ port: 3000 });

// apiServer.option("/api", { origin: FRONT_END_ORIGIN }).subscribe();

// apiServer
//   .get("/api")
//   .pipe(
//     tap(({ response }) => {
//       response.writeHead(200, {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
//       });
//       response.end(
//         JSON.stringify({
//           results: [
//             {
//               employeeId: 1,
//               employeeName: "Thanadit",
//             },
//             {
//               employeeId: 2,
//               employeeName: "Buthong",
//             },
//           ],
//         })
//       );
//     })
//   )
//   .subscribe();

// apiServer
//   .post("/api")
//   .pipe(apiServer.withJsonBody())
//   .subscribe(({ response, body }) => {
//     response.writeHead(200, {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
//     });
//     response.end(
//       JSON.stringify({
//         serverReceived: body,
//       })
//     );
//   });

// apiServer.option("/api-form-data", { origin: FRONT_END_ORIGIN }).subscribe();

// apiServer
//   .post("/api-form-data")
//   .pipe(
//     apiServer.withFormData({
//       filePath: ({ fieldname, file, info, request }) => {
//         return path.join(__dirname, "uploads", info.filename);
//       },
//     })
//   )
//   .subscribe(({ request, response, formData }) => {
//     response.writeHead(200, {
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
//     });
//     response.end(
//       JSON.stringify({
//         serverReceived: formData,
//       })
//     );
//   });
