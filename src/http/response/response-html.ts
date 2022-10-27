import http from "http";
import {
  MonoTypeOperatorFunction,
  OperatorFunction,
  switchMap,
  tap,
} from "rxjs";
import { readStreamFile } from "../../read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";

export function responseHTML(response: http.ServerResponse, html: string) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(html);
  response.end();
}

export function responseHTMLFile(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return switchMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((html) => {
        responseHTML(response, html as string);
      })
    );
  });
}
