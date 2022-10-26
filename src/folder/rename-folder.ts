import fs from "fs";
import { bindNodeCallback } from "rxjs";

export const renameFolder = bindNodeCallback(fs.rename);
