import { Readable, Transform, Writable } from "stream";

// const replacer = new Transform({
//   encoding: "utf-8",
//   transform(chunk, encoding, next) {
//     next(null, "xxxx");
//   },
// });

// replacer.write("sdfsdfaagag");

// const readable = new Readable();

// const wriable = new Writable({
//   write(chunk, encoding, next) {
//     console.log(chunk);
//     next();
//   },
// });

// readable.pipe(replacer).pipe(wriable);

// readable.read();
