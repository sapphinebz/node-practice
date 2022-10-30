import { Observable } from "rxjs";
import https from "https";
import fs from "fs";

export function httpDownloadProgress(
  path: string,
  streamInto?: fs.WriteStream
) {
  return new Observable<{ progress: string; chunks: string }>((subscriber) => {
    const abortController = new AbortController();
    const request = https.get(path, {
      method: "GET",
      signal: abortController.signal,
    });

    let totalByte = 0;
    let currentByte = 0;
    let chunks = "";

    request.on("response", (response) => {
      if (streamInto) {
        response.pipe(streamInto);
      }

      totalByte = parseInt(response.headers["content-length"] || `0`, 10);
      subscriber.next({
        progress: `0.00`,
        chunks: "",
      });

      response.on("data", (chunk) => {
        chunks += chunk;
        currentByte += chunk.length;

        subscriber.next({
          progress: ((currentByte / totalByte) * 100).toFixed(2),
          chunks: chunks,
        });
      });

      response.on("end", () => {
        subscriber.complete();
      });

      response.on("error", (err) => {
        subscriber.error(err);
      });
    });

    return {
      unsubscribe: () => {
        abortController.abort();
      },
    };
  });
}
