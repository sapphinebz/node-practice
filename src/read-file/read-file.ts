import fs from "fs";
import { bindNodeCallback } from "rxjs";

export const readFile = bindNodeCallback(fs.readFile);
