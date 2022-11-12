import { Observable } from "rxjs";
import {} from "rxjs/operators";
import {} from "rxjs/fetch";
import { RequestHandler } from "express";
import { ClientRequestHttp } from "./app-express";

// Example
// const routerApi = express.Router();
// const app = express();

// app.listen(3000, () => {
//   console.log(`Example app listening on port ${3000}`);
// });

// app.use("/api", routerApi);

// const api$ = fromHttpExpress((handler) => {
//   routerApi.get("/", handler);
// }).pipe(share());

// api$.subscribe(({ response }) => {
//   response.send("Hi API ");
// });

/**
 * transform express middleware to observable
 * @param project express creating middleware
 * @returns Observable
 */

export function fromHttpExpress(
  project: (requestHandler: RequestHandler) => void
) {
  return new Observable<ClientRequestHttp>((subscriber) => {
    project((request, response) => {
      if (!subscriber.closed) {
        subscriber.next({ request, response });
      } else {
        response.writeHead(404, "Not Found");
        response.end();
      }
    });
  });
}
