import { tap } from "rxjs/operators";
import { HttpCreateServer } from "../../../http/server/http-create-server";

const frontendServer = new HttpCreateServer({ port: 4200 });

frontendServer.static("public").subscribe();

const apiServer = new HttpCreateServer({ port: 3000 });

apiServer.option("/api", { origin: "http://localhost:4200" }).subscribe();

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

apiServer
  .option("/api-form-data", { origin: "http://localhost:4200" })
  .subscribe();

apiServer.post("/api-form-data").subscribe(({ request, response }) => {
  // const chunks: any[] = [];
  let chunks = "";
  request.setEncoding("binary");
  request.on("data", (chunk) => {
    // chunks.push(chunk);
    console.log("chunk", chunk);
    chunks += chunk;
  });
  request.on("end", () => {
    console.log("end:", chunks);
    // JSON.stringify(chunks);
    // const buffered = Buffer.concat(chunks) as any;
    // console.log("---", buffered.get("filename"));
    // console.log("--buffered", buffered);
  });
  const body = { result: true };
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
