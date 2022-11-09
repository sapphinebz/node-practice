export function clickAnchorDownload(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  document.body.append(anchor);
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(blobUrl);
}
