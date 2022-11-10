import { OutgoingHttpHeader, OutgoingHttpHeaders } from "http";
import { OperatorFunction } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import { readStreamFile } from "../../file/read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";

export function streamFileToResponse(
  path: string,
  headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]
): OperatorFunction<ClientMessage, string | Buffer> {
  return mergeMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((file) => {
        response.writeHead(200, headers);
        response.write(file);
        response.end();
      })
    );
  });
}
