import fs from "fs";
import { Observable } from "rxjs";

export function readTextFile(
  path: string,
  options: { stream: boolean } = { stream: true }
) {
  const { stream: streamLike } = options;
  const readStream = fs.createReadStream(path, { encoding: "utf8" });

  return new Observable<string>((subscriber) => {
    if (streamLike) {
      readStream.on("open", () => {
        subscriber.next("");
      });
      readStream.on("data", (chunk) => {
        subscriber.next(chunk as string);
      });
      readStream.once("end", () => {
        subscriber.complete();
      });
    } else {
      let chunks: string = "";

      readStream.on("data", (chunk) => {
        chunks += chunk;
      });
      readStream.once("end", () => {
        subscriber.next(chunks);
        subscriber.complete();
      });
    }

    readStream.once("error", (err) => {
      subscriber.error(err);
    });

    return {
      unsubscribe: () => {
        readStream.close();
      },
    };
  });
}
