import { mkdir } from "fs/promises";
import { from } from "rxjs";

export function createFolder(path: string) {
  return from(mkdir(path, { recursive: true }));
}
