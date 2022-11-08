import { Observable } from "rxjs";

export function fromFileToURL(file: File): Observable<string> {
  return new Observable<string>((subscriber) => {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const loadHandler = () => {
        if (typeof reader.result === "string") {
          subscriber.next(reader.result);
          subscriber.complete();
        }
      };
      reader.addEventListener("load", loadHandler);
      return {
        unsubscribe: () => {
          reader.removeEventListener("load", loadHandler);
        },
      };
    } else {
      subscriber.complete();
    }
  });
}
