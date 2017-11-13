import * as express from "express";
import * as core from "express-serve-static-core";
import * as path from "path";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import * as _ from "lodash";
import { router as contacts } from "./contacts-router";
import * as cors from "cors";

export const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/hello", (req, res) => {
  if ("name" in req.query) res.end(`Hello ${req.query.name}`);
  else res.end("Hello all");
});

app.get("/test", (req, res) => {
  res.json(req.query);
});

app.get("/hello/:name", (req, res) => {
  res.send(`hello ${req.params.name}`);
});

app.use(contacts);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//development error handler, will print stacktrace
if (app.get("env") === "development") {
  app.use(((error: Error, req, res, next) => {
    res.status(error.status || 500);
    res.render("error", {
      message: error.message,
      error,
    });
  }) as core.ErrorRequestHandler);
}

//production error handler,no stacktrace leaked to user
app.use(((error: Error, req, res, next) => {
  res.status(error.status || 500);
  res.render("error", {
    message: error.message,
    error: {},
  });
}) as core.ErrorRequestHandler);

const port = 3000;

app.listen(port, "localhost", () => {
  console.log(`Server started at port ${port}`);
});
