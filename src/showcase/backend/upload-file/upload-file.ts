import express from "express";
import fs from "fs";
import path from "path";
import { Observable, Subscription } from "rxjs";
import { concatMap, tap } from "rxjs/operators";
import { fromHttpExpress } from "../../../express/from-http-express";
import { createFolderIfNotExist } from "../../../file/folder/create-folder-if-not-exist";
import { UploadMulter } from "../../../multer/upload-multer";
import { fromListener } from "../../../operators/from-listener";

const uploadMulter = new UploadMulter({
  destination: path.join(__dirname, "uploads"),
  filename: (request, file) => `${Date.now()}-${file.originalname}`,
});

const apiExpress = express();
apiExpress.use(express.static("public"));
apiExpress.listen(3000, () => {});

/**
 * Upload Single File
 */

fromHttpExpress((handler) => {
  apiExpress.post("/upload-single-file", handler);
})
  .pipe(
    concatMap(({ request, response }) => {
      console.log("/upload-single-file");
      response.status(200);
      response.set("Content-Type", "application/json");
      const contentType = request.header("Content-Type");

      let ext = "txt";
      switch (contentType) {
        case "image/png":
          ext = "png";
          break;
        case "image/jpeg":
          ext = "jpg";
          break;
        case "video/quicktime":
          ext = "mov";
          break;
      }
      const filePath = path.join(__dirname, "uploads", `${Date.now()}.${ext}`);

      return manualUpload(filePath, request, response).pipe(tap(console.log));
    })
  )
  .subscribe();

function manualUpload(
  filePath: string,
  request: express.Request,
  response: express.Response
) {
  return new Observable<{ progress: number }>((subscriber) => {
    const subscription = new Subscription();
    const contentLength = parseInt(request.header("Content-Length") || "1", 10);
    let progress = 0;
    createFolderIfNotExist(filePath);

    const writestream = fs.createWriteStream(filePath);
    request.pipe(writestream);

    let length = 0;

    subscription.add(
      fromListener<any>(writestream, "error").subscribe((err) => {
        console.log("error");
        subscriber.error(err);
      })
    );

    subscription.add(
      fromListener<any>(request, "data").subscribe((data) => {
        console.log("data");
        length += data.length;
        progress = (length / contentLength) * 100;
        subscriber.next({ progress });
      })
    );

    subscription.add(
      fromListener<void>(writestream, "finish").subscribe(() => {
        console.log("finish upload!");
        response.end(JSON.stringify({ success: true }));
        subscriber.complete();
      })
    );

    return subscription;
  });
}

/**
 * Upload Multiple Files
 */

fromHttpExpress((handler) => {
  apiExpress.post("/upload-multiple-files", handler);
})
  .pipe(uploadMulter.uploadMultipleFiles("files"))
  .subscribe(({ request, response }) => {
    response.json({ message: "Successfully uploaded files" });
  });

/**
 * Upload Sigle File Progress
 */

fromHttpExpress((handler) => {
  apiExpress.post("/upload-single-file-progress", handler);
})
  .pipe(uploadMulter.uploadSingleFile("file"))
  .subscribe(({ request, response }) => {
    response.json({ message: "Successfully uploaded files" });
  });
