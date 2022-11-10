import fs from "fs";
import path from "path";
import {
  AsyncSubject,
  from,
  MonoTypeOperatorFunction,
  Observable,
  of,
} from "rxjs";
import { catchError, concatMap, map, takeUntil, toArray } from "rxjs/operators";

export class FromDirectory {
  constructor(public basePath: string) {}

  readdir(path: fs.PathLike = this.basePath) {
    return new Observable<string[]>((subscriber) => {
      fs.readdir(path, (err, files) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next(files);
          subscriber.complete();
        }
      });
    });
  }

  createFolder(pathLike: string) {
    return new Observable<void>((subscriber) => {
      return fs.mkdir(
        path.join(this.basePath, pathLike),
        { recursive: true },
        (err) => {
          if (err) {
            subscriber.error(err);
          } else {
            subscriber.next();
            subscriber.complete();
          }
        }
      );
    });
  }

  filterFile(
    predicate: (filename: string) => boolean
  ): MonoTypeOperatorFunction<string[]> {
    return map((files) => files.filter((file) => predicate(file)));
  }

  filterExt(ext: string): MonoTypeOperatorFunction<string[]> {
    return map((files) => files.filter((file) => file.endsWith(ext)));
  }

  sort(
    project: (fileA: fs.Stats, fileB: fs.Stats) => number
  ): MonoTypeOperatorFunction<string[]> {
    return map((files) => {
      return files.sort((filenameA, filenameB) => {
        const fileA = fs.statSync(`${this.basePath}/${filenameA}`);
        const fileB = fs.statSync(`${this.basePath}/${filenameB}`);
        return project(fileA, fileB);
      });
    });
  }

  renamePattern(
    project: (filename: string, index: number, extname?: string) => string
  ): MonoTypeOperatorFunction<string[]> {
    return (source: Observable<string[]>) =>
      new Observable<string[]>((subscriber) => {
        const onUnsubscribe$ = new AsyncSubject<void>();
        source.pipe(takeUntil(onUnsubscribe$)).subscribe({
          next: (files) => {
            from(files)
              .pipe(
                concatMap((sourceFilename, i) => {
                  const fromPath = path.join(this.basePath, sourceFilename);
                  const targetFilename = project(
                    sourceFilename,
                    i,
                    path.extname(fromPath)
                  );
                  const toPath = path.join(this.basePath, targetFilename);
                  if (sourceFilename !== targetFilename) {
                    return this.rename(fromPath, toPath).pipe(
                      map(() => targetFilename),
                      catchError((err) => {
                        console.log(`${err}`);
                        return of(sourceFilename);
                      })
                    );
                  }
                  return of(sourceFilename);
                }),
                toArray(),
                takeUntil(onUnsubscribe$)
              )
              .subscribe({
                next: (renamedFiles) => {
                  subscriber.next(renamedFiles);
                  subscriber.complete();
                },
                error: (err) => {
                  subscriber.error(err);
                },
              });
          },
          error: (err) => subscriber.error(err),
        });

        return {
          unsubscribe: () => {
            onUnsubscribe$.next();
            onUnsubscribe$.complete();
          },
        };
      });
  }

  rename(oldPath: fs.PathLike, newPath: fs.PathLike) {
    return new Observable<void>((subscriber) => {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next();
          subscriber.complete();
        }
      });
    });
  }
}
