import { RequestHandler } from "express";
const busboy = require("busboy");

export function formDataToBody(): RequestHandler {
  return (request, response, next) => {
    let formData = {} as any;
    let bb: any;
    try {
      bb = busboy({ headers: request.headers });
    } catch (err) {
      next(err);
    }

    bb.on("field", (name: string, val: any, info: any) => {
      formData[name] = val;
    });
    bb.on("error", (err: any) => {
      next(err);
    });
    bb.on("close", () => {
      request.body = formData;
      request.unpipe(bb);
      next();
    });
    request.pipe(bb);
  };
}
