import express, { RequestHandler } from "express";
import { Readable } from "stream";

const busboy = require("busboy");

interface BusboyInfo {
  filename: string;
  encoding: string;
  mimeType: string;
}

export interface BusboyFileBody {
  file: Readable;
  info: BusboyInfo;
}

export interface BusboyFormDataBody {
  value: any;
  info: BusboyInfo;
}

export type BusboyBody = BusboyFileBody | BusboyFormDataBody;

export type BusboyMap = Map<string, BusboyBody>;

export function isBusboyFileBody(body: BusboyBody): body is BusboyFileBody {
  return (body as BusboyFileBody).file !== undefined;
}

export function isBusboyFormDataBody(
  body: BusboyBody
): body is BusboyFormDataBody {
  return (body as BusboyFormDataBody).value !== undefined;
}

export function busboyFormData(options: {
  onFile: (fileOptions: {
    fieldname: string;
    file: Readable;
    info: BusboyInfo;
    request: express.Request;
    response: express.Response;
  }) => void;
  onClose: (closeOptions: {
    request: express.Request;
    response: express.Response;
  }) => void;
  onField: (fieldOptions: {
    fieldname: string;
    value: any;
    info: BusboyInfo;
    request: express.Request;
    response: express.Response;
  }) => void;
}): RequestHandler {
  return (request, response, next) => {
    const formData = new Map();
    let bb: any;
    try {
      bb = busboy({ headers: request.headers });
    } catch (err) {
      next(err);
    }

    bb.on("file", (fieldname: string, file: Readable, info: BusboyInfo) => {
      options.onFile({
        fieldname,
        file,
        info,
        request,
        response,
      });
    });

    bb.on("field", (fieldname: string, value: any, info: any) => {
      options.onField({ fieldname, value, info, request, response });
    });

    bb.on("close", () => {
      options.onClose({
        request,
        response,
      });
      request.unpipe(bb);
      bb.removeAllListeners();
    });

    bb.on("error", (err: any) => {
      next(err);
    });

    request.pipe(bb);
  };
}
