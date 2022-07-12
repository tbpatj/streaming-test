const express = require("express");
const fs = require("fs");
const { send } = require("process");
const app = express();

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/comments", (req, res) => {
  res.status(200).send("whats up boi");
});

app.get("/api/video", function (req, res) {
  const range = req.headers.range;
  //we need to get a range header if none is present we will send back a f400
  if (!range) {
    res.status(400).send("requires Range header");
  }

  const videoPath = "movie.mp4";
  //get the video size
  const videoSize = fs.statSync("movie.mp4").size;

  //Parse range
  //Example: "bytes=32324-";
  //about one megabyte
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  //return the next chunk size if the chunk goes beyond the video size just return the rest of the vidoe
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  //we are only sending back partial data which is why we send a 206
  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
