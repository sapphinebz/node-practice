import { OperatorFunction } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import { readStreamFile } from "../../file/read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";

export function responseJavascriptFile(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return mergeMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((javascript) => {
        response.writeHead(200, {
          "Content-Type": "text/javascript; charset=UTF-8",
        });
        response.write(javascript);
        response.end();
      })
    );
  });
}
