import express from "express";
import path from "path";
import { concat } from "rxjs";
import { mergeMap, shareReplay } from "rxjs/operators";
import { fromHttpExpress } from "../../../express/from-http-express";
import { allowOrigin } from "../../../express/middlewares/allow-origin";
import { optionsEnableCors } from "../../../express/middlewares/options-enable-cors";
import { readFileStreamToResponse } from "../../../file/read-file/read-stream-file-to-response";
import { httpDownload } from "../../../http/http-download";

const apiExpress = express();
apiExpress.listen(3000, () => {});

const clientExpress = express();
clientExpress.use(express.static("public"));
clientExpress.listen(4200, () => {});

const FRONT_END_ORIGIN = "http://localhost:4200";

const _pdfPath = `${__dirname}/pdf/rxjs.pdf`;
const downloadPdf$ = httpDownload(
  `https://hoclaptrinhdanang.com/downloads/pdf/react/RxJS%20in%20Action.pdf`,
  _pdfPath
).pipe(
  shareReplay({
    refCount: false,
    bufferSize: 1,
    windowTime: 20000,
  })
);

apiExpress.options("/package", optionsEnableCors(FRONT_END_ORIGIN));
apiExpress.get(
  "/package",
  allowOrigin(FRONT_END_ORIGIN),
  (request, response) => {
    response.download(path.join(process.cwd(), "package.json"));
  }
);

apiExpress.options("/pdf", optionsEnableCors(FRONT_END_ORIGIN));

fromHttpExpress((handler) => {
  apiExpress.get("/pdf", allowOrigin(FRONT_END_ORIGIN), handler);
})
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

apiExpress.options("/data", optionsEnableCors(FRONT_END_ORIGIN));
apiExpress.get("/data", allowOrigin(FRONT_END_ORIGIN), (request, response) => {
  response.status(200).json({
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

apiExpress.options("/pdf-packt", optionsEnableCors(FRONT_END_ORIGIN));
fromHttpExpress((handler) => {
  apiExpress.get("/pdf-packt", allowOrigin(FRONT_END_ORIGIN), handler);
})
  .pipe(
    mergeMap((client) => {
      const { response } = client;
      // ให้เปิดเผย headers ของ response ให้กับ client ถ้าต่าง origin
      response.set("Access-Control-Expose-Headers", "*");
      return readFileStreamToResponse({
        filePath: path.join(
          process.cwd(),
          "public",
          "assets",
          "pdf",
          "Packt.Reactive.Patterns.with.RxJS.for.Angular.1801811512.pdf"
        ),
        fileName: "packt.pdf",
        streamToResponse: client.response,
      });
    })
  )
  .subscribe();
