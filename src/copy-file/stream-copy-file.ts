import fs from "fs";
import { Observable } from "rxjs";
export function streamCopyFile(path: string, toPath: string) {
  return new Observable<void>((subscriber) => {
    if (!fs.existsSync(path)) {
      console.log(path);
      subscriber.error(new Error("file is not existed"));
      return;
    }
    const inputStream = fs.createReadStream(path);
    const outputStream = fs.createWriteStream(toPath);
    inputStream.pipe(outputStream);

    outputStream.on("error", (err) => {
      subscriber.error(err);
    });

    inputStream.on("error", (err) => {
      subscriber.error(err);
    });

    outputStream.on("finish", () => {
      subscriber.next();
      subscriber.complete();
    });

    return {
      unsubscribe: () => {
        inputStream.close();
        outputStream.close();
      },
    };
  });
}
