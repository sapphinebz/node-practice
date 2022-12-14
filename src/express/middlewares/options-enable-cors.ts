import { RequestHandler } from "express";

export function optionsEnableCors(origin?: string): RequestHandler {
  return (request, response) => {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": origin || request.headers.origin,
      "Access-Control-Allow-Headers":
        "access-control-allow-origin,Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    });
    response.end();
  };
}
