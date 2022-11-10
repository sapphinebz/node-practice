import { Observable, Subject } from "rxjs";
import { fromListener } from "../operators/from-listener";

export function fromCmdInput() {
  return new Observable<string>((subscriber) => {
    const stdin = process.stdin;
    stdin.setEncoding("utf-8");
    return fromListener(stdin, "data").subscribe(subscriber);
  });
}
