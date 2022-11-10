import * as fs from "fs/promises";
import { defer } from "rxjs";
import { createFolderIfNotExist } from "../../folder/create-folder-if-not-exist";

export function writeJsonArrayToXls(
  path: string,
  jsonArray: { [key: string]: string }[]
) {
  return defer(() => {
    createFolderIfNotExist(path);
    let content = ``;
    for (const json of jsonArray) {
      content += Object.values(json).join("\t") + "\n";
    }
    let closed = false;
    return fs.writeFile(path, content);
  });
}
