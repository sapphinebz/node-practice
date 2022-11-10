import * as fs from "fs";
import path from "path";

export function createFolderIfNotExist(folderWithFilePath: string) {
  const dirPath = path.dirname(folderWithFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
