import { share, switchMap, tap } from "rxjs/operators";
import { responseHTML } from "./http/response/response-html";
import { responsePlainText } from "./http/response/response-plain-text";
import { httpCreateServer, whenRoute } from "./http/server/http-create-server";
import { readStreamFile } from "./read-file/read-stream-file";
import { WebSocketObservable } from "./web-socket/web-socket-observable";

const server$ = httpCreateServer({ port: 4200 }).pipe(share());

const homePage$ = readStreamFile(`${process.cwd()}/public/web-socket.html`);

server$
  .pipe(
    whenRoute({
      url: "/text",
      method: "GET",
    })
  )
  .subscribe(({ response }) => {
    responsePlainText(response, "Hello Text");
  });

server$
  .pipe(
    whenRoute({
      url: "/",
      method: "GET",
    }),
    switchMap((client) => {
      return homePage$.pipe(
        tap((html) => {
          responseHTML(client.response, html as string);
        })
      );
    })
  )
  .subscribe();

const socket$ = new WebSocketObservable({ port: 4000 });
socket$.subscribe((message) => {
  socket$.boardcast(`${message}`);
});
