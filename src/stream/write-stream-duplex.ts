import { Subject, zip } from "rxjs";
import { Duplex } from "stream";

export function writeStreamDuplex() {
  const writeSubject = new Subject<Buffer>();
  const readSubject = new Subject<void>();
  const duplex = new Duplex({
    read(size: number) {
      readSubject.next();
    },
    write(chunk, encoding, next) {
      writeSubject.next(chunk);
      next();
    },
    final(callback) {},
  });

  const subscription = zip([writeSubject, readSubject]).subscribe(
    ([chunk, _]) => {
      duplex.push(chunk);
    }
  );

  duplex.on("end", () => {
    subscription.unsubscribe();
  });

  duplex.on("close", () => {
    subscription.unsubscribe();
  });

  return duplex;
}
