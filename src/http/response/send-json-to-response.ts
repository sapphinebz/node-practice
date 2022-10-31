import { MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";
import { ClientMessage } from "../server/http-create-server";
import { responseJSON } from "./response-json";

export function sendJsonToServer(
  json: any
): MonoTypeOperatorFunction<ClientMessage> {
  return tap((client: ClientMessage) => {
    responseJSON(client.response, json);
  });
}
