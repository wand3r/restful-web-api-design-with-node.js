import * as express from "express";
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

export const apiV1 = () => {
  const db = contactsDb();
  insertContacts(db, readContacts().result);

  const apiV1 = express.Router();

  apiV1
    .route("/:number")
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

  apiV1.get("/", (req, res) => {
    const mode: "stream" | "batch" = req.query.mode;
    if (mode === "batch")
      streamContacts(db)
        .toArray()
        .subscribe(contacts => res.json(contacts), err => res.sendStatus(500));
    else {
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
    }
  });

  return apiV1;
};
