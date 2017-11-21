import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import { apiV1 } from "./contacts-api-v1";

const server = express();

server.set("port", process.env.PORT || 3000);
server.set("host", process.env.HOST || "localhost");

server.use(logger("dev"));
server.use(bodyParser.json());

server.use("/api/v1/contacts", apiV1());

server.get("/error", (req, res) => {
  throw new Error("Error Message");
});

server.listen(server.get("port"), server.get("host"), () => {
  console.log(`Server started at ${server.get("host")}:${server.get("port")}`);
});
