/**
 * regex substring filename of header content-disposition from response
 * @param contentDisposition
 * @returns
 */
export function exactFilename(contentDisposition: string) {
  return contentDisposition.match(/filename\=(.+?)(?:\r|\n)/)?.[1];
}
