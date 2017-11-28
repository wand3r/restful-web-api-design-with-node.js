import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as cors from "cors";
import * as passport from "passport";
import * as expressSession from "express-session";
import * as mongoSession from "connect-mongo";
import { OAuth2Strategy as GoogleAuth } from "passport-google-oauth";
import { BasicStrategy } from "passport-http";
import { apiV1 } from "./contacts-api-v1";
import { apiV2 } from "./contacts-api-v2";
import { connect, Db } from "mongodb";
import { mongoDbUri } from "./config";
import { basicAuth } from "./basicAuthMiddleware";
import {
  findUser,
  FindUser,
  verifyPassword,
  routes as usersRoutes,
} from "./users";
import {
  enableBasicAuthentication as enableAuthentication,
  basicAuthMiddleware as authenticationMiddleware,
  authorizationMiddleware,
} from "./authentication";

const startServer = (defaultPort: number, defaultHost: string) =>
  new Promise<express.Express>((resolve, reject) => {
    const server = express();
    server.set("port", process.env.PORT || defaultPort);
    server.set("host", process.env.HOST || defaultHost);

    server.listen(server.get("port"), server.get("host"), () =>
      resolve(server),
    );
  });

const formatServerInfo = (server: express.Express): string =>
  `Server started at ${server.get("host")}:${server.get("port")}`;

const session = (db: Db) =>
  expressSession({
    store: new (mongoSession(expressSession))({ db }),
    secret: "session-secret",
    resave: false,
    saveUninitialized: true,
  });

const addRoutes = (server: express.Express, db: Db) => {
  server.use("/api/users", authorizationMiddleware("Admin"), usersRoutes(db));
  server.use("/api/v1/contacts", apiV1());
  server.use("/api/v2/contacts", apiV2(db));
  server.use(
    "/api/contacts",
    (req, res, next) => {
      next();
    },
    apiV2(db),
  );
  server.use("/redirect", (req, res) => {
    res.redirect("/api/contacts");
  });
  server.get("/error", (req, res) => {
    throw new Error("Error Message");
  });
};

Promise.all([startServer(3000, "localhost"), connect(mongoDbUri)])
  .then(([server, db]) => {
    console.log(formatServerInfo(server));

    server.use(logger("dev"));
    server.use(bodyParser.json());
    server.use(cors({ origin: "http://localhost:3001", credentials: true }));
    server.use(session(db));
    enableAuthentication(server, findUser(db));
    server.use(authenticationMiddleware()),
      server.use((req, res, next) => {
        console.log(req.session);
        console.log(req.sessionID);
        next();
      });
    addRoutes(server, db);
  })
  .catch(err => {
    console.log("Error on server start up");
    console.error(err);
  });
