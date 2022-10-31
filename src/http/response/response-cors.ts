import http from "http";
import { ClientMessage } from "../server/http-create-server";

export function responseCors(
  clientRequest: ClientMessage,
  options: { origin: string }
) {
  const { response, request } = clientRequest;
  //   response.setHeader("Access-Control-Allow-Headers","Authorization");

  const statusCode = request.method === "OPTIONS" ? 204 : 200;
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": options.origin,
    "Access-Control-Allow-Methods": "GET,PUT,POST,PATCH,OPTIONS",
  });
}
