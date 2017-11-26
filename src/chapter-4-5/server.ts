import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as cors from "cors";
import { apiV1 } from "./contacts-api-v1";
import { apiV2 } from "./contacts-api-v2";
import { connect, Db } from "mongodb";
import { mongoDbUri } from "./config";

const startServer = (defaultPort: number, defaultHost: string) =>
  new Promise<express.Express>((resolve, reject) => {
    const server = express();

    server.set("port", process.env.PORT || defaultPort);
    server.set("host", process.env.HOST || defaultHost);

    server.use(logger("dev"));
    server.use(bodyParser.json());
    server.use(cors());
    server.listen(server.get("port"), server.get("host"), () =>
      resolve(server),
    );
  });

const formatServerInfo = (server: express.Express) =>
  `Server started at ${server.get("host")}:${server.get("port")}`;

Promise.all([startServer(3000, "localhost"), connect(mongoDbUri)])
  .then(([server, db]) => {
    console.log(formatServerInfo(server));

    server.use("/api/v1/contacts", apiV1());
    server.use("/api/v2/contacts", apiV2(db));
    server.use("/api/contacts", apiV2(db));
    server.use("/redirect", (req, res) => {
      res.redirect("/api/contacts");
    });
    server.get("/error", (req, res) => {
      throw new Error("Error Message");
    });
  })
  .catch(err => {
    console.log("Error on server start up");
    console.error(err);
  });
