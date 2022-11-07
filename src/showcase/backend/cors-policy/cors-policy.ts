import { tap } from "rxjs/operators";
import { HttpCreateServer } from "../../../http/server/http-create-server";

const frontendServer = new HttpCreateServer({ port: 4200 });

frontendServer.static("public").subscribe();

const apiServer = new HttpCreateServer({ port: 3000 });

apiServer
  .option("/api")
  .pipe(
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
        // "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      });
      response.end();
    })
  )
  .subscribe();

apiServer
  .get("/api")
  .pipe(
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

apiServer
  .post("/api")
  .pipe(apiServer.withJsonBody())
  .subscribe(({ response, body }) => {
    response.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:4200",
    });
    response.end(
      JSON.stringify({
        serverReceived: body,
      })
    );
  });
