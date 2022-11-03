import { OperatorFunction } from "rxjs";
import { Header } from "../header/header";
import { ClientMessage } from "../server/http-create-server";
import { streamFileToResponse } from "./stream-file-to-response";
export function streamHTMLFileToResponse(
  path: string
): OperatorFunction<ClientMessage, string | Buffer> {
  return streamFileToResponse(path, { ...Header.HTML });
}
