import { AppExpress } from "../../express/app-express";
import fs from "fs";
import path from "path";

const appExpress = new AppExpress({ port: 3000 });

appExpress.get("/").pipe(appExpress.redirectTo("upload-file.html")).subscribe();

appExpress.static("public");

appExpress.post("/send").subscribe(({ request, response }) => {
  response.status(200);
  response.set("Content-Type", "application/json");
  //   response.set("Content-Type", "text/plain");
  const contentType = request.header("Content-Type");
  const contentLength = parseInt(request.header("Content-Length") || "1", 10);
  let progress = 0;
  let ext = "txt";
  switch (contentType) {
    case "image/png":
      ext = "png";
      break;
    case "image/jpeg":
      ext = "jpg";
      break;
    case "video/quicktime":
      ext = "mov";
      break;
  }
  console.log(ext);
  const writestream = fs.createWriteStream(path.join(__dirname, `file.${ext}`));
  request.pipe(writestream);
  let length = 0;
  request.on("data", (data) => {
    length += data.length;
    progress = (length / contentLength) * 100;
    console.log(progress);
  });

  writestream.on("finish", () => {
    response.end(JSON.stringify({ success: true }));
  });
});
