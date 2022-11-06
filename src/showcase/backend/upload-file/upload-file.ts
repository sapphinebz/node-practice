import fs from "fs";
import path from "path";
import { AppExpress } from "../../../express/app-express";
import { createFolderIfNotExist } from "../../../folder/create-folder-if-not-exist";
import multer from "multer";

const appExpress = new AppExpress({ port: 3000 });

appExpress.static("public");

/**
 * Upload Single File
 */

appExpress.post("/upload-single-file").subscribe(({ request, response }) => {
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
  const filePath = path.join(__dirname, "uploads", `${Date.now()}.${ext}`);

  createFolderIfNotExist(filePath);

  const writestream = fs.createWriteStream(filePath);

  request.pipe(writestream);
  let length = 0;
  request.on("data", (data) => {
    length += data.length;
    progress = (length / contentLength) * 100;
  });

  writestream.on("finish", () => {
    response.end(JSON.stringify({ success: true }));
  });
});

/**
 * Upload Multiple Files
 */

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMiddelWare = multer({
  storage: storage,
});

appExpress.app.post(
  "/upload-multiple-files",
  uploadMiddelWare.array("files"),
  (request, response) => {
    response.json({ message: "Successfully uploaded files" });
  }
);