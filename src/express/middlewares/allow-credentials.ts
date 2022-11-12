import { RequestHandler } from "express";

export function allowCredentials(): RequestHandler {
  return (request, response, next) => {
    response.setHeader("Access-Control-Allow-Credentials", "true");
    next();
  };
}
