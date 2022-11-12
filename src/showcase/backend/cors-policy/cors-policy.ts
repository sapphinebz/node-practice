import path from "path";

import express from "express";
import { allowOrigin } from "../../../express/middlewares/allow-origin";
import { formDataFileUpload } from "../../../express/middlewares/form-data-file-upload";
import { formDataToBody } from "../../../express/middlewares/form-data-to-body";
import { optionsEnableCors } from "../../../express/middlewares/options-enable-cors";
import { generateToken } from "../../../http/token/generate-token";
import { generateMillsec } from "../../../time/generate-millisec";
import { allowCredentials } from "../../../express/middlewares/allow-credentials";

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

// Cookies ใน browser เก็บที่เดียวกันหมด แต่ละ tab จะเห็นข้อมูลที่เก็บเหมือนกัน

// same-site
// ประกอบด้วย domain suffix และ ส่วนที่อยู่ก่อน domain
// ทั้ง 2 อันนี้อยู่ same-site
// www.web.dev
// static.web.dev

// ถ้าไม่ใช่พวก .com หรือ public suffix
// ไม่ถือว่าเป็น domain เดียวกัน
//  your-project.github.io
//  my-project.github.io
// ถือว่าเป็น cross-site request.

// domain ของ cookies จะถูกกำหนด domain เป็นของ domain backend

// sameSite: "strict",
// จะไม่ส่ง cookies จาก frontend ไป backend เลย ถ้า cross-site
// ไม่ให้เข้าไปใน transactional pages จาก external linke ได้

// sameSite: "lax",
// เข้าผ่าน external link ก็เล่น session เดิมต่อได้
// cr

// sameSite: "none"
// ไม่มีการป้องกันอะไรเลย
// cross-site ก็ส่ง cookie (ที่ต่าง domain) กันให้ด้วย

// ถ้า frontend site กับ backend site ไม่ตรงกัน จะไม่ auto set Cookie ที่ frontend ให้

backend.options("/fetch-cookies", allowCredentials(), optionsEnableCors());
backend.get(
  "/fetch-cookies",
  allowCredentials(),
  allowOrigin(),
  (request, response) => {
    const token = generateToken();
    const millisec = generateMillsec({
      days: 30,
    });
    response.cookie("token", token, {
      maxAge: millisec,
      path: "/",
      secure: true,
      // sameSite: "strict",
      sameSite: "lax",
      // sameSite: "none",
    });

    // response.set("Access-Control-Expose-Headers", "*");

    response.send({ message: "set-cookie header sent with maxAge" });
  }
);
