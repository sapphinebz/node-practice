import { Observable } from "rxjs";
import fs from "fs";
import { ServerResponse } from "http";

export function readFileStreamToResponse(options: {
  filePath: string;
  fileName: string;
  streamToResponse: ServerResponse;
}) {
  return new Observable((subscriber) => {
    const response = options.streamToResponse;
    const readStream = fs.createReadStream(options.filePath);
    const stat = fs.statSync(options.filePath);
    response.setHeader("Content-Length", stat.size);
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      `Content-Disposition`,
      `attachment; filename=${options.fileName}`
    );
    readStream.once("end", () => {
      subscriber.next();
      subscriber.complete();
    });
    readStream.once("error", (err) => {
      subscriber.error(err);
    });
    readStream.pipe(response);
    return {
      unsubscribe: () => {
        readStream.close();
      },
    };
  });
}
