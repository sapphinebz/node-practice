import express from "express";
import fs from "fs";
import fsPromise from "fs/promises";
import { concatMap, EMPTY, exhaustMap, mergeMap } from "rxjs";
import { fromHttpExpress } from "../../../express/from-http-express";
import { readFile } from "../../../file/read-file/read-file";
import path from "path";

interface Employee {
  employeeId: number;
}

const app = express();

app.listen(3000, () => {});

const apiRouter = express.Router();

app.use("/api", apiRouter);

const DATABASE_PATH = path.join(
  process.cwd(),
  "public",
  "assets",
  "jsons",
  "database.json"
);

const readDatabase = () => {
  return fsPromise
    .readFile(DATABASE_PATH, { encoding: "utf-8" })
    .then((content) => JSON.parse(content) as Employee[]);
};

const findAll$ = fromHttpExpress((handler) => {
  apiRouter.get("/findAll", handler);
});

const add$ = fromHttpExpress((handler) => {
  apiRouter.post("/add", express.json(), handler);
});

const remove$ = fromHttpExpress((handler) => {
  apiRouter.delete("/remove/:id", handler);
});

remove$
  .pipe(
    concatMap(({ request, response }) => {
      return readDatabase().then((json) => {
        const params = request.params;
        const index = json.findIndex((j) => j.employeeId === Number(params.id));
        if (index > -1) {
          json.splice(index, 1);
          return fsPromise
            .writeFile(DATABASE_PATH, JSON.stringify(json))
            .then(() => {
              response.json({ success: true });
            });
        }
        response.writeHead(409, "not found employee in database");
        response.end();
      });
    })
  )
  .subscribe();

add$
  .pipe(
    concatMap(({ request, response }) => {
      return readDatabase()
        .then((json) => {
          const employee: Employee = request.body;
          const index = json.findIndex(
            (j) => j.employeeId === employee.employeeId
          );
          if (index > -1) {
            json[index] = employee;
          } else {
            json.push(request.body);
          }
          return fsPromise.writeFile(DATABASE_PATH, JSON.stringify(json));
        })
        .then(() => {
          response.json({ success: true });
        });
    })
  )
  .subscribe();

findAll$
  .pipe(
    mergeMap(({ response }) => {
      return readDatabase().then((file) => {
        response.type("json");
        response.send(JSON.stringify(file));
      });
    })
  )
  .subscribe();
