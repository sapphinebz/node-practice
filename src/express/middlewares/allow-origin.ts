import { RequestHandler } from "express";

export function allowOrigin(origin: string): RequestHandler {
  return (request, response, next) => {
    response.set("Access-Control-Allow-Origin", origin);
    next();
  };
}
