import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const app = express();

https.createServer({
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port, function () {
  console.log(
      "App listening on port 3000!"
  );
});

app.use('/static', express.static('spa/build'));
app.use(cookieParser());
app.use(bodyParser.json());

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/", (_, res) => {
  res.send(":)");
});

app.get("/api/getUser", (req, res) => {
  res.json({"user": req.cookies.user || null});
});

app.get("/api/loginUser", (req, res) => {
  res.cookie('user', req.body['user'], {httpOnly: true, secure: true, sameSite: 'strict'}).redirect('/api/getUser');
});

app.get("/api/logoutUser", (req, res) => {
  res.clearCookie('user').redirect('/api/getUser');
});

app.get('*', (req, res, next) => {
  if (!req.cookies.user && req.url != '/login') res.redirect('/login');
  else next();
});
