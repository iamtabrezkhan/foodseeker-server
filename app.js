const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const PORT = process.env.PORT || 5000;

app.use(cors());

const Storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, `testImage${path.extname(file.originalname)}`);
  },
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public"));
  },
});

var upload = multer({ storage: Storage }).single("testImage");

let detectImage = function (imagePath) {
  return new Promise((resolve, reject) => {
    const { spawn } = require("child_process");
    const pyprog = spawn("./test.sh", [imagePath], {
      cwd: path.join(__dirname, "../Food-Recognition"),
    });
    let resp;
    pyprog.stdout.on("data", function (data) {
      console.log("data coming: ", JSON.parse(data));
      resp = JSON.parse(data);
    });
    pyprog.stdout.on("end", () => {
      console.log("data end");
      resolve(resp);
    });
    pyprog.stderr.on("data", (data) => {});
  });
};

app.get("/", (req, res, next) => {
  res.send("Hello World");
});

app.post("/test", (req, res, next) => {
  upload(req, res, (err) => {
    console.log("upload");
    if (err) {
      throw err;
    }
    var image = req.file;
    detectImage(image.path).then((response) => {
      console.log("RESPONSE: ", response);
      return res.json(response);
    });
  });
});

app.post("/hello", (req, res, next) => {
  return res.json({
    hello: "hello",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
});
