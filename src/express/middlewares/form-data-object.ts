import { RequestHandler } from "express";
import { Readable } from "stream";
import { fromListener } from "../../operators/from-listener";
import { take, share, AsyncSubject } from "rxjs";

import fs from "fs";

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

export function formDataObject(): RequestHandler {
  return (request, response, next) => {
    const formData = new Map();
    let bb: any;
    try {
      bb = busboy({ headers: request.headers });
    } catch (err) {
      next(err);
    }

    const onClose$ = new AsyncSubject<void>();

    bb.on("file", (fieldname: string, file: Readable, info: BusboyInfo) => {
      formData.set(fieldname, { file, info });
    });

    bb.on("field", (fieldname: string, value: any, info: any) => {
      formData.set(fieldname, { value, info });
    });

    bb.on("close", () => {
      onClose$.next();
      onClose$.complete();
    });

    bb.on("error", (err: any) => {
      next(err);
    });

    onClose$.subscribe(() => {
      request.body = formData;
      request.unpipe(bb);
      next();
    });

    request.pipe(bb);
  };
}
