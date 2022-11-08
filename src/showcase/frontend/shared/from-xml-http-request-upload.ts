import { Observable } from "rxjs";

export function fromXMLHttpRequestUpload(url: string, formData: FormData) {
  return new Observable<number>((subscriber) => {
    let request = new XMLHttpRequest();
    request.open("POST", url);
    // request.setRequestHeader(
    //   "Content-Type",
    //   "application/x-www-form-urlencoded"
    // );
    // request.setRequestHeader("Content-Type", "multipart/form-data");

    // upload progress event
    const progressHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
      // upload progress as percentage
      let percent_completed = (e.loaded / e.total) * 100;
      console.log(percent_completed);
      subscriber.next(percent_completed);
    };
    request.upload.addEventListener("progress", progressHandler);

    const uploadCompleteHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.complete();
    };

    request.upload.addEventListener("load", uploadCompleteHandler);

    const uploadErrorHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.error(event);
    };
    request.upload.addEventListener("error", uploadErrorHandler);

    const uploadTimeoutHandler = (
      event: ProgressEvent<XMLHttpRequestEventTarget>
    ) => {
      subscriber.error(new Error("timeout"));
    };
    request.upload.addEventListener("timeout", uploadTimeoutHandler);

    // // request finished event
    // const loadHandler = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
    //   // HTTP status message (200, 404 etc)
    //   console.log(request.status);

    //   // request.response holds response from the server
    //   console.log(request.response);
    // };
    // request.addEventListener("load", loadHandler);

    // send POST request to server
    request.send(formData);

    return {
      unsubscribe: () => {
        request.upload.removeEventListener("progress", progressHandler);
        request.upload.removeEventListener("load", uploadCompleteHandler);
        request.upload.removeEventListener("error", uploadErrorHandler);
        request.upload.removeEventListener("timeout", uploadTimeoutHandler);
        // request.removeEventListener("load", loadHandler);
      },
    };
  });
}
