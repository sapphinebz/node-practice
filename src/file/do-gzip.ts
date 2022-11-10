import fs from "fs";
import { Observable } from "rxjs";
import { addAbortSignal, pipeline } from "stream";
import zlib from "zlib";

export function doGzip(input: string, output: string) {
  return new Observable<void>((subscriber) => {
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(input);
    const destination = fs.createWriteStream(output);
    const controller = new AbortController();
    const stream = pipeline(source, gzip, destination, (err) => {
      if (err) {
        subscriber.error(err);
      } else {
        subscriber.next();
        subscriber.complete();
      }
    });
    const read = addAbortSignal(controller.signal, stream);
    return {
      unsubscribe: () => {
        controller.abort();
      },
    };
  });
}
