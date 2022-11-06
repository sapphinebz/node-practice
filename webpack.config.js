const path = require("path");
const fs = require("fs");
const WEB_SCRIPTS_PATH = "./src/showcase/frontend";

const readEntryPath = () => {
  let config = {};
  const dirNameList = fs.readdirSync(path.resolve(__dirname, WEB_SCRIPTS_PATH));
  for (const dirName of dirNameList) {
    config[dirName] = `${WEB_SCRIPTS_PATH}/${dirName}/script.ts`;
  }
  return config;
};

module.exports = {
  mode: "development",
  entry: readEntryPath(),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    clean: true,
    filename: "[name]/script.js",
    path: path.resolve(__dirname, "public", "scripts"),
  },
};
