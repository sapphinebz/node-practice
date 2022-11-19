import { endWith, Subject, Subscription, throttleTime } from "rxjs";
import { Duplex } from "stream";

export function throttleStream(duration: number) {
  const onChunk = new Subject<Buffer | null>();
  let subscription: Subscription;

  const duplex = new Duplex({
    read(size) {},

    write(chunk, encoding, next) {
      onChunk.next(chunk);
      next();
    },

    final(next) {
      subscription.unsubscribe();
      next();
    },
  });

  subscription = onChunk
    .pipe(throttleTime(duration), endWith(null))
    .subscribe((chunk) => {
      duplex.push(chunk);
    });

  return duplex;
}
