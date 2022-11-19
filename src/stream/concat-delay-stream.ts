import { Duplex } from "stream";

/**
 * ข้อมูลทุกตัวที่ส่งเข้ามา จะถูก write ออกไปครบถ้วนทุกตัว แต่มีการ delay
 * @param delay in milisec
 * @returns
 */
export function concatDelayStream(delay: number) {
  const duplex = new Duplex({
    // ทำงานเมื่อ writeStream หลังจากนี้อ่านไฟล์
    // throttleStream.pipe(writeStream)
    read(size) {},

    // ถูกเรียกจาก ReadableStream ก่อนหน้านี้
    // ReabableStream.pipe(throttleStream)
    // ทำงานแบบ concatMap จะทำครั้งต่อไป เมื่อสั่ง next()
    write(chunk, encoding, next) {
      setTimeout(() => {
        this.push(chunk);
        next();
      }, delay);
    },

    final(next) {
      this.push(null);
      next();
    },
  });

  return duplex;
}
