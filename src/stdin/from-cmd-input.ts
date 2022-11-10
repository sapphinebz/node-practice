import { Observable, Subject } from "rxjs";

export function fromCmdInput() {
  return new Observable<string>((subscriber) => {
    const stdin = process.stdin;
    stdin.setEncoding("utf-8");
    stdin.on("data", (data) => {
      subscriber.next(data as unknown as string);
    });

    stdin.on("close", () => {
      subscriber.complete();
    });

    stdin.on("end", () => {
      subscriber.complete();
    });

    stdin.on("error", (err) => {
      subscriber.error(err);
    });

    return {
      unsubscribe: () => {
        stdin.removeAllListeners();
      },
    };
  });
}
