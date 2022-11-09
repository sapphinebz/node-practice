import path from "path";
import { tap } from "rxjs/operators";
import { HttpCreateServer } from "../../../http/server/http-create-server";

const frontendServer = new HttpCreateServer({ port: 4200 });

frontendServer.static("public").subscribe();

const apiServer = new HttpCreateServer({ port: 3000 });

const FRONT_END_ORIGIN = "http://localhost:4200";

apiServer.option("/api", { origin: FRONT_END_ORIGIN }).subscribe();

apiServer
  .get("/api")
  .pipe(
    tap(({ response }) => {
      response.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
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

apiServer
  .post("/api")
  .pipe(apiServer.withJsonBody())
  .subscribe(({ response, body }) => {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
    });
    response.end(
      JSON.stringify({
        serverReceived: body,
      })
    );
  });

apiServer.option("/api-form-data", { origin: FRONT_END_ORIGIN }).subscribe();

apiServer
  .post("/api-form-data")
  .pipe(
    apiServer.withFormData({
      filePath: ({ fieldname, file, info, request }) => {
        return path.join(__dirname, "uploads", info.filename);
      },
    })
  )
  .subscribe(({ request, response, formData }) => {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": FRONT_END_ORIGIN,
    });
    response.end(
      JSON.stringify({
        serverReceived: formData,
      })
    );
  });
