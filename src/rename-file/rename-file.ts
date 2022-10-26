import fs from "fs";
import { bindNodeCallback } from "rxjs";

export const renameFile = bindNodeCallback(fs.rename);
