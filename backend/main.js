/* eslint-disable @typescript-eslint/no-var-requires */
const app = require("express")();
const cors = require("cors");
const fs = require("fs");
const port = 43210;

app.use(cors());

const content = fs.readFileSync("tasklist", "utf8");
let tasklist = eval(content);

app.get("/levels", (req, res) => {
  res.json(tasklist);
});

app.listen(port);

console.log(tasklist);
console.log("Server started");
