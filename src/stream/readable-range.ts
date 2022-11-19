import { Readable } from "stream";
import { range } from "../generator/range";

export function readableRange(min: number, max: number) {
  return Readable.from(range(min, max));
}
