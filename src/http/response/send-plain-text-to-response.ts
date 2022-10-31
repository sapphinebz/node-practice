import { MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";
import { ClientMessage } from "../server/http-create-server";

export function sendPlainTextToResponse(
  text: string
): MonoTypeOperatorFunction<ClientMessage> {
  return tap(({ response }) => {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/plain");
    response.end(text);
  });
}
