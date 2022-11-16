import { Observable } from "rxjs";

// ถ้าใช้ method HEAD แทน method GET จะได้ response headers กลับมาจาก response backend
// มีประโยชน์คือถ้า method GET ส่งไปแล้วจะเป็นการ download ไฟล์ขนาดใหญ่มาก เราไม่ควร download ดังนั้น
// ให้ส่ง methoe HEAD ไปก่อน เพื่อให้ response headers กลับมาจาก backend เพืื่อเช็ค Content-Length ก่อนที่จะ donwload
// response ของ request method HEAD จะไม่มี body ดังนั้นจึงประหยัด bandwidth
// statusCode ของ response ควรจะเป็น 204 No Content
// ใช้รักษา band-width
export function fromXMLHttpHead<T = any>(url: string) {
  return new Observable<T>((subscriber) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url);
    const loadHandler = () => {
      if (xhr.status != 200) {
        subscriber.error({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      } else {
        subscriber.next(xhr.response);
        subscriber.complete();
      }
    };
    const errorHandler = (event: ProgressEvent<XMLHttpRequestEventTarget>) => {
      subscriber.error(xhr.statusText);
    };
    xhr.addEventListener("load", loadHandler);
    xhr.addEventListener("error", errorHandler);

    xhr.send();

    return {
      unsubscribe() {
        xhr.removeEventListener("load", loadHandler);
        xhr.removeEventListener("error", errorHandler);
        xhr.abort();
      },
    };
  });
}
