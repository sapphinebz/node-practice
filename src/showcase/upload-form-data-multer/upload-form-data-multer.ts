import path from "path";
import multer from "multer";
import { AppExpress } from "../../express/app-express";

const appExpress = new AppExpress({ port: 3000 });

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMiddelWare = multer({
  storage: storage,
});

appExpress.static("public");
appExpress.app.post(
  "/upload",
  uploadMiddelWare.array("files"),
  (request, response) => {
    response.json({ message: "Successfully uploaded files" });
  }
);
