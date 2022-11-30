const express = require("express");
const serveIndex = require("serve-index");

const app = express();
const port = 3000;
const wwwDir = ".";

app.use((req, res, next) => {
  console.log("req: ", req);
  res.setHeader("X-Truc", "bidule");
  next();
});

app.use(express.static(wwwDir));
app.use(serveIndex(wwwDir, { icons: true }));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
