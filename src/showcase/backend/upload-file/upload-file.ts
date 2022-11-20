import express from "express";
import fs from "fs";
import path from "path";
import { Observable, Subject, Subscription } from "rxjs";
import { concatMap, mergeMap, tap } from "rxjs/operators";
import { Duplex, PassThrough, Readable } from "stream";
import { fromHttpExpress } from "../../../express/from-http-express";
import { createFolderIfNotExist } from "../../../file/folder/create-folder-if-not-exist";
import { UploadMulter } from "../../../multer/upload-multer";
import { fromListener } from "../../../operators/from-listener";
import { fromWritable } from "../../../operators/from-writable";
// import net from 'net';

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

const onBusboyFile$ = new Subject<{
  fieldname: string;
  file: Readable;
  info: {
    filename: string;
    encoding: string;
    mimeType: string;
  };
  response: express.Response;
  request: express.Request;
}>();

onBusboyFile$
  .pipe(
    mergeMap(({ fieldname, file, info, request, response }) => {
      return new Promise<void>((resolve, reject) => {
        const { filename } = info;
        const stream = fs.createWriteStream(
          path.join(__dirname, "uploads", `${Date.now()}${filename}`)
        );
        file
          .pipe(stream)
          .on("finish", () => {
            resolve();
          })
          .on("close", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      }).catch((err) => {
        console.error(err);
      });
    })
  )
  .subscribe();

fromHttpExpress((handler) => {
  apiExpress.post("/upload-single-file-throttle", handler);
}).subscribe(({ request, response }) => {
  const busboy = require("busboy");

  let bb: any;
  bb = busboy({ headers: request.headers });

  bb.on(
    "file",
    (
      fieldname: string,
      file: Readable,
      info: {
        filename: string;
        encoding: string;
        mimeType: string;
      }
    ) => {
      onBusboyFile$.next({ fieldname, file, info, request, response });
    }
  );

  bb.on("field", (fieldname: string, value: any, info: any) => {});

  bb.on("close", () => {
    response.end();
  });

  bb.on("error", (err: any) => {
    response.writeHead(500);
    response.end(err);
  });

  request.pipe(bb);
});

fromHttpExpress((handler) => {
  apiExpress.post("/duplex-single-file", handler);
})
  .pipe(
    concatMap(({ request, response }) => {
      console.log("upload");
      const reportProgress = new PassThrough();

      const filePath = path.join(__dirname, "uploads", `${Date.now()}.jpg`);

      const writeStream = fs.createWriteStream(filePath);

      const length = Number(request.headers["content-length"] || 0);
      let total = 0;

      reportProgress.on("data", (data: string | Buffer) => {
        total += data.length;
        console.log(`${total}/${length}`);
      });

      const duplex = new Duplex({
        autoDestroy: true,
        write(_chunk, encoding, next) {
          console.log("write");
          this.push(_chunk);
          console.log("next");
          next();
        },
        read() {
          console.log("read");
        },
        final() {
          console.log("final");
          this.push(null);
          // this.end();
        },
      });
      duplex.pipe(response);

      return fromWritable(
        request.pipe(duplex).pipe(reportProgress).pipe(writeStream)
      );

      // pipeline bug ไรวะ
      // return fromAbortController((abortController) => {
      //   return stream_ps.pipeline(
      //     request,
      //     throttle,
      //     reportProgress,
      //     writeStream,
      //     {
      //       signal: abortController.signal,
      //     }
      //   );
      // }).pipe(
      //   tap(() => {
      //     response.json({ success: true });
      //   })
      // );
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
