import { RequestHandler } from "express";
import { Readable } from "stream";
import { createFolderIfNotExist } from "../../file/folder/create-folder-if-not-exist";
import {
  BusBoyIncomingFile,
  BusBoyInfo,
} from "../../http/server/http-create-server";
import fs from "fs";
import { fromListener } from "../../operators/from-listener";
import { share } from "rxjs/operators";
const busboy = require("busboy");

export function formDataFileUpload(options: {
  formDataToBody: boolean;
  filePath: (busboyFile: BusBoyIncomingFile) => string;
}): RequestHandler {
  return (request, response, next) => {
    let bb: any;

    let formData: any;

    try {
      bb = busboy({ headers: request.headers });
    } catch (err) {
      next(err);
      return;
    }
    const onClose$ = fromListener(bb, "close").pipe(share());

    bb.on("file", (fieldname: string, file: Readable, info: BusBoyInfo) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${fieldname}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );
      const filePath = options.filePath({
        fieldname,
        file,
        info,
        request,
      });

      createFolderIfNotExist(filePath);
      const writeStream = fs.createWriteStream(filePath);
      file.pipe(writeStream);
      writeStream.on("error", (err) => {
        // remove file
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            next(unlinkErr);
          } else {
            next(err);
          }
        });
      });
    });

    if (options.formDataToBody) {
      formData ??= {};
      bb.on("field", (name: string, val: any, info: any) => {
        formData[name] = val;
      });

      onClose$.subscribe(() => {
        request.body = formData;
      });
    }

    onClose$.subscribe(() => {
      request.unpipe(bb);
      next();
    });

    request.pipe(bb);
  };
}
