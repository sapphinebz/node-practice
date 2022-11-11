import { FromDirectory } from "./from-directory";
export function renameVideoFiles(pathLike: string) {
  const directory = new FromDirectory(pathLike);
  return directory.readdir().pipe(
    directory.filterExt(".mov"),
    directory.sort((fileA, fileB) => {
      return fileA.birthtime.getTime() - fileB.birthtime.getTime();
    }),
    directory.renamePattern((filename, index, ext) => {
      if (ext) {
        const name = `chapter${index + 1}${ext}`;
        return name;
      }
      return filename;
    })
  );
}
