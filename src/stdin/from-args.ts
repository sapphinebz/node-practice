import { from } from "rxjs";

export function fromArgs() {
  return from(process.argv);
}
