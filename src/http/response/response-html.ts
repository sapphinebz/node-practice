import { IncomingMessage, ServerResponse } from "http";
import { OperatorFunction, mergeMap, tap } from "rxjs";
import { readStreamFile } from "../../read-file/read-stream-file";
import { ClientMessage } from "../server/http-create-server";
export function responseHTML(
  response: ServerResponse<IncomingMessage>,
  html: string
) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(html);
  response.end();
}
