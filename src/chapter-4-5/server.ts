import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as cors from "cors";
import * as passport from "passport";
import { BasicStrategy } from "passport-http";
import { apiV1 } from "./contacts-api-v1";
import { apiV2 } from "./contacts-api-v2";
import { connect, Db } from "mongodb";
import { mongoDbUri } from "./config";
import { basicAuth } from "./basicAuthMiddleware";
import { userExist, findUser, FindUser, verifyPassword } from "./users";

const startServer = (defaultPort: number, defaultHost: string) =>
  new Promise<express.Express>((resolve, reject) => {
    const server = express();

    server.set("port", process.env.PORT || defaultPort);
    server.set("host", process.env.HOST || defaultHost);

    server.listen(server.get("port"), server.get("host"), () =>
      resolve(server),
    );
  });

const formatServerInfo = (server: express.Express) =>
  `Server started at ${server.get("host")}:${server.get("port")}`;

const addBasicAuthenticationToPassport = (findUser: FindUser) => {
  passport.use(
    new BasicStrategy((userName, password, done) =>
      findUser(userName)
        .then(user => {
          if (user === null || !verifyPassword(user, password))
            done(null, false);
          else done(null, user);
        })
        .catch(err => done(err)),
    ),
  );
};

const addAuthentication = (server: express.Express, db: Db) => {
  addBasicAuthenticationToPassport(findUser(db));
  server.use(passport.initialize());
  server.use(passport.authenticate("basic", { session: false }));
  // server.use(basicAuth(userExist(db)));
};

const addRoutes = (server: express.Express, db: Db) => {
  server.use("/api/v1/contacts", apiV1());
  server.use("/api/v2/contacts", apiV2(db));
  server.use("/api/contacts", apiV2(db));
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
    server.use(cors());

    addAuthentication(server, db);
    addRoutes(server, db);
  })
  .catch(err => {
    console.log("Error on server start up");
    console.error(err);
  });
