import path from "path";
import { tap } from "rxjs/operators";
import { streamHTMLFileToResponse } from "../../http/response/stream-html-file-to-response";
import {
  httpCreateServer,
  whenRoute,
} from "../../http/server/http-create-server";

const frontendServer$ = httpCreateServer({ port: 4200 });

frontendServer$
  .pipe(
    whenRoute({ method: "GET", url: "/" }),
    streamHTMLFileToResponse(
      path.join(process.cwd(), "public", "cors-policy.html")
    )
  )
  .subscribe();

const apiServer$ = httpCreateServer({ port: 3000 });

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
        // "Access-Control-Allow-Credentials": "true",
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
