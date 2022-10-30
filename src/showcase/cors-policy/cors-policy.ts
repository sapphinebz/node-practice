import cors from "cors";
import { concat } from "rxjs";
import { mergeMap, shareReplay } from "rxjs/operators";
import { AppExpress } from "../../express/app-express";
import { httpDownload } from "../../http/http-download";
import { readStreamAndResponseHTML } from "../../http/response/response-html";
import { readFileStreamToResponse } from "../../read-file/read-stream-file-to-response";

const apiExpress = new AppExpress({ port: 4200 });
const httpExpress = new AppExpress({ port: 3000 });

const corsOptions = cors({
  origin: "http://localhost:3000",
});
const _pdfPath = `${__dirname}/pdf/rxjs.pdf`;
const downloadPdf$ = httpDownload(
  `https://hoclaptrinhdanang.com/downloads/pdf/react/RxJS%20in%20Action.pdf`,
  _pdfPath
).pipe(shareReplay(1));

httpExpress
  .get("/")
  .pipe(readStreamAndResponseHTML(`${process.cwd()}/public/cors-policy.html`))
  .subscribe();

apiExpress.options("/pdf", corsOptions).subscribe();
apiExpress
  .get("/pdf", corsOptions)
  .pipe(
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

apiExpress.options("/data", corsOptions).subscribe();

apiExpress.get("/data", corsOptions).subscribe((client) => {
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
