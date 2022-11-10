import fs from "fs/promises";
import { defer } from "rxjs";
import { createFolderIfNotExist } from "../folder/create-folder-if-not-exist";

export function appendTextFile(path: string, content: string) {
  return defer(() => {
    createFolderIfNotExist(path);
    return fs.appendFile(path, content);
  });
}
