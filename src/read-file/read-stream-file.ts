import fs from "fs";
import { Observable } from "rxjs";

export function readStreamFile(path: string) {
  return new Observable<string | Buffer>((subscriber) => {
    const readStream = fs.createReadStream(path, { encoding: "utf8" });
    // readStream.on("open", () => {
    //   console.log("open");
    // });
    readStream.on("data", (chunk) => {
      subscriber.next(chunk);
    });
    readStream.on("error", (err) => {
      subscriber.error(err);
    });
    readStream.on("end", () => {
      subscriber.complete();
    });

    return {
      unsubscribe: () => {
        readStream.close();
      },
    };
  });
}
