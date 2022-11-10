import * as fs from "fs/promises";
import { defer } from "rxjs";
import { createFolderIfNotExist } from "../folder/create-folder-if-not-exist";

export default function writeTextFile(path: string, content: string) {
  return defer(() => {
    createFolderIfNotExist(path);
    return fs.writeFile(path, content);
  });
}
