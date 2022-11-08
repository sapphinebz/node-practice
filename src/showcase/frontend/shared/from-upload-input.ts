import { filter, fromEvent, map, Observable } from "rxjs";

export function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: false }
): Observable<File>;
export function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: true }
): Observable<FileList>;
export function fromUploadInput(
  element: HTMLInputElement,
  mode: { multiple: boolean }
) {
  return fromEvent(element, "change").pipe(
    filter(() => {
      return element.files!.length > 0;
    }),
    map(() => {
      if (mode.multiple) {
        return element.files!;
      }
      return element.files![0];
    })
  );
}
