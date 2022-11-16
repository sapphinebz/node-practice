import { EMPTY } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { ajax } from "rxjs/ajax";
import { catchError, first, map, tap } from "rxjs/operators";
import { fromXMLHttpRequestUpload } from "../shared/from-xml-http-request-upload";

// custom elements
import "../shared/custom-element/uploader.element";
import { UploaderElement } from "../shared/custom-element/uploader.element";
import { percentString } from "../shared/percent-string";

/**
 * Single File Upload (Attached Body)
 */
{
  const uploaderElement = document.querySelector<UploaderElement>(
    "[data-single-file-attached-body]"
  )!;

  uploaderElement.uploadFactory = (file) => {
    return fromFetch("/upload-single-file", {
      method: "POST",
      body: file,
      // duplex: "half",
      selector: (res) => res.json(),
    }).pipe(
      tap(() => {
        uploaderElement.nextUpload();
      }),
      catchError((err) => {
        return EMPTY;
      })
    );
  };
}

/**
 * Multiple Files Upload
 */
{
  const uploaderElement = document.querySelector<UploaderElement>(
    "[data-multiple-files-upload]"
  )!;

  uploaderElement.uploadMultipleFilesFactory = (fileList) => {
    const formData = new FormData();
    const filesArray = Array.from(fileList);

    filesArray.forEach((file) => {
      formData.append("files", file);
    });

    return fromFetch("/upload-multiple-files", {
      method: "POST",
      body: formData,
    }).pipe(
      tap(() => {
        uploaderElement.nextUpload();
      }),
      catchError((err) => {
        return EMPTY;
      })
    );
  };
}

/**
 * Single File Upload Progress
 */
{
  const uploaderElement = document.querySelector<UploaderElement>(
    "[data-single-file-progress]"
  )!;

  uploaderElement.uploadFactory = (file, filename) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("fileName", filename!);
    return fromXMLHttpRequestUpload(
      "/upload-single-file-progress",
      formData
    ).pipe(
      tap(() => {
        uploaderElement.nextUpload();
      }),
      catchError((err) => {
        return EMPTY;
      })
    );
  };
}

/**
 * Duplex Stream Upload Progress
 */
{
  const uploaderElement = document.querySelector<UploaderElement>(
    "[data-duplex-upload-file]"
  )!;

  uploaderElement.uploadFactory = (file) => {
    return fromFetch("/duplex-single-file", {
      method: "POST",
      body: file,
      selector: (res) => res.blob(),
    }).pipe(
      tap((blob) => {
        console.log(blob);
        uploaderElement.nextUpload();
      }),
      catchError((err) => {
        return EMPTY;
      })
    );
  };
}

/**
 * RxJS Ajax Upload
 */
{
  const containerEl =
    document.querySelector<HTMLElement>(`[data-ajax-upload]`)!;

  const uploaderElement =
    containerEl.querySelector<UploaderElement>("[data-uploader]")!;

  const percentEl = document.querySelector<HTMLElement>(`[data-percent]`)!;

  uploaderElement.uploadFactory = (file) => {
    percentEl.innerText = `0 %`;
    return ajax<any>({
      url: "/upload-single-file",
      method: "POST",
      includeUploadProgress: true,
      body: file,
    }).pipe(
      tap((ajaxResponse) => {
        percentEl.innerText = percentString(
          ajaxResponse.loaded,
          ajaxResponse.total
        );
      }),
      first((ajaxResponse) => ajaxResponse.type === "upload_load"),
      map((ajaxResponse) => {
        uploaderElement.nextUpload();
        return ajaxResponse.response;
      }),
      catchError((err) => {
        return EMPTY;
      })
    );
  };
}

// application/x-www-form-urlencoded
// application/json
// multipart/form-data
