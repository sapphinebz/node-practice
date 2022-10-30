import { IncomingMessage, ServerResponse } from "http";

export function responseJSON(
  response: ServerResponse<IncomingMessage>,
  json: { [key: string]: any }
) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(json));
}
