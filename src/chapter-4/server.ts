import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import {
  contactsDb,
  insertContacts,
  notFound,
  streamContacts,
  deleteContacts,
  getContact,
} from "./contacts-leveldb-repository";
import { readContacts } from "../chapter-3/contacts";
import "rxjs/add/operator/toArray";

const server = express();

server.set("port", process.env.PORT || 3000);
server.set("host", process.env.HOST || "localhost");

server.use(logger("dev"));
server.use(bodyParser.json());

const db = contactsDb();
insertContacts(db, readContacts().result);

server
  .route("/contacts/:number")
  .get((req, res) => {
    getContact(db, req.params.number)
      .then(contact => res.json(contact))
      .catch(
        err => (notFound(err) ? res.sendStatus(404) : res.sendStatus(500)),
      );
  })
  .put((req, res) => {
    insertContacts(db, [req.body])
      .then(() => res.sendStatus(201))
      .catch(err => res.sendStatus(500));
  })
  .delete((req, res) => {
    deleteContacts(db, [req.params.number])
      .then(() => res.sendStatus(204))
      .catch(() => res.sendStatus(500));
  });

server.get("/contacts", (req, res) => {
  streamContacts(db)
    .toArray()
    .subscribe(contacts => res.json(contacts), err => res.sendStatus(500));
});

server.get("/contacts-stream", (req, res) => {
  res.contentType("application/json");
  res.write("[");
  streamContacts(db)
    .bufferCount(2, 1)
    .subscribe(
      ([contact, next]) =>
        res.write(JSON.stringify(contact) + (next ? "," : "")),
      err => res.sendStatus(500),
      () => res.end("]"),
    );
});

server.get("/error", (req, res) => {
  throw new Error("Error Message");
});

server.listen(server.get("port"), server.get("host"), () => {
  console.log(`Server started at ${server.get("host")}:${server.get("port")}`);
});
