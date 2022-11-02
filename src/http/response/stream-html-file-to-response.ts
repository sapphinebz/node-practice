import { OperatorFunction } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import { readStreamFile } from "../../read-file/read-stream-file";
import { Header } from "../header/header";
import { ClientMessage } from "../server/http-create-server";
export function streamHTMLFileToResponse(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return mergeMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((html) => {
        response.writeHead(200, { ...Header.HTML });
        response.write(html);
        response.end();
      })
    );
  });
}
