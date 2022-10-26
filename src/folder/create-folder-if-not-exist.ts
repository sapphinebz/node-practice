import * as fs from "fs";

export function createFolderIfNotExist(folderWithFilePath: string) {
  const folderPath = removeFilePath(folderWithFilePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function removeFilePath(folderWithFilePath: string) {
  return folderWithFilePath.replace(/\/\w+\.\w+$/g, "");
}
