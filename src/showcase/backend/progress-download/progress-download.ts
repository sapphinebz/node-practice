import cors from "cors";
import { concat } from "rxjs";
import { mergeMap, shareReplay } from "rxjs/operators";
import path from "path";
import { httpDownload } from "../../../http/http-download";
import { AppExpress } from "../../../express/app-express";
import { readFileStreamToResponse } from "../../../read-file/read-stream-file-to-response";

const apiExpress = new AppExpress({ port: 3000 });
const httpExpress = new AppExpress({ port: 4200 });
httpExpress.static("public");

const FRONT_END_ORIGIN = "http://localhost:4200";
// const corsOptions = cors({
//   origin: "http://localhost:4200",
// });
const _pdfPath = `${__dirname}/pdf/rxjs.pdf`;
const downloadPdf$ = httpDownload(
  `https://hoclaptrinhdanang.com/downloads/pdf/react/RxJS%20in%20Action.pdf`,
  _pdfPath
).pipe(shareReplay(1));

apiExpress.options("/package", { origin: FRONT_END_ORIGIN }).subscribe();
apiExpress
  .get("/package")
  .pipe(
    apiExpress.setHeaderAllowOrigin(FRONT_END_ORIGIN),
    apiExpress.download(path.join(process.cwd(), "package.json"))
  )
  .subscribe();

apiExpress.options("/pdf", { origin: FRONT_END_ORIGIN }).subscribe();

apiExpress
  .get("/pdf")
  .pipe(
    apiExpress.setHeaderAllowOrigin(FRONT_END_ORIGIN),
    mergeMap((client) => {
      return concat(
        downloadPdf$,
        readFileStreamToResponse({
          filePath: _pdfPath,
          fileName: "rxjs.pdf",
          streamToResponse: client.response,
        })
      );
    })
  )
  .subscribe();

apiExpress.options("/data", { origin: FRONT_END_ORIGIN }).subscribe();

apiExpress
  .get("/data")
  .pipe(apiExpress.setHeaderAllowOrigin(FRONT_END_ORIGIN))
  .subscribe((client) => {
    client.response.status(200).json({
      results: [
        {
          employeeId: 1,
          employeeName: "Thanadit",
        },
        {
          employeeId: 2,
          employeeName: "Sowaluk",
        },
      ],
    });
  });
