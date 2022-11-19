import { fromEvent } from "rxjs";
import { tap } from "rxjs/operators";

export function createDownloadAnchor(
  blob: Blob,
  filename = `${new Date().getTime()}`,
  displayFilename = "get this file"
) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.innerText = displayFilename;
  anchor.href = blobUrl;
  anchor.download = filename;

  const onClick$ = fromEvent<PointerEvent | TouchEvent>(anchor, "click").pipe(
    tap({
      unsubscribe: () => {
        URL.revokeObjectURL(blobUrl);
      },
    })
  );

  return [anchor, onClick$] as const;
}
