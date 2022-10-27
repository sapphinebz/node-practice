import http from "http";
import { OperatorFunction } from "rxjs";
import { switchMap, tap } from "rxjs/operators";
import { readStreamFile } from "../../read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";

export function responseJavascript(
  response: http.ServerResponse,
  javascript: string
) {
  response.writeHead(200, { "Content-Type": "text/javascript; charset=UTF-8" });
  response.write(javascript);
  response.end();
}

export function responseJavascriptFile(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return switchMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((javascript) => {
        responseJavascript(response, javascript as string);
      })
    );
  });
}
