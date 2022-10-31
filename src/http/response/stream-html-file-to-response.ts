import { OperatorFunction } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import { readStreamFile } from "../../read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";
import { responseHTML } from "./response-html";

export function streamHTMLFileToResponse(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return mergeMap(({ response }) => {
    return readStreamFile(path).pipe(
      tap((html) => {
        responseHTML(response, html as string);
      })
    );
  });
}
