import { Observable, switchMap, takeLast } from "rxjs";
import { httpGetStream } from "./http-stream-get";
import fs from "fs";
import fsPromise from "fs/promises";
import { createFolderIfNotExist } from "../folder/create-folder-if-not-exist";
import https from "https";
import http from "http";

export function httpDownload(url: string, toLocation: string) {
  return new Observable<void>((subscriber) => {
    const abortController = new AbortController();
    const httpClient = url.startsWith("https") ? https : http;
    let writeFile: fs.WriteStream;
    httpClient.get(
      url,
      { method: "GET", signal: abortController.signal },
      (res) => {
        if (res.statusCode === 200) {
          createFolderIfNotExist(toLocation);
          writeFile = fs.createWriteStream(toLocation);
          res.pipe(writeFile);
          res.on("error", subscriber.error);
          res.once("close", () => {
            subscriber.next();
            subscriber.complete();
          });
        } else {
          res.resume();
          subscriber.error(
            new Error(`Request Failed With a Status Code: ${res.statusCode}`)
          );
        }
      }
    );
    return () => {
      abortController.abort();
      if (writeFile) {
        writeFile.end();
      }
    };
  });
}
