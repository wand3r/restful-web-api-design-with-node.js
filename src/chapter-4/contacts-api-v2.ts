import * as express from "express";
import { Db } from "mongodb";
import {
  findByNumber,
  insertOrReplace,
  remove,
  findAll,
  findByArg,
} from "./contacts-mongodb-repository";
import { CombineLatestSubscriber } from "rxjs/operators/combineLatest";
import { options } from "../utils";
import { contactsDb } from "./contacts-leveldb-repository";

export const apiV2 = (db: Db) => {
  const apiV2 = express.Router();

  apiV2
    .route("/:number")
    .get((req, res) =>
      findByNumber(db, req.params.number)
        .then(contact => (contact ? res.json(contact) : res.sendStatus(404)))
        .catch(err => res.sendStatus(500)),
    )
    .put((req, res) =>
      insertOrReplace(db, req.params.number, req.body)
        .then(result =>
          options(result, {
            inserted: () => res.sendStatus(201),
            replaced: () => res.sendStatus(200),
          }),
        )
        .catch(err => res.sendStatus(500)),
    )
    .delete((req, res) =>
      remove(db, req.params.number)
        .then(result =>
          options(result, {
            removed: () => res.sendStatus(200),
            "not-found": () => res.sendStatus(200),
          }),
        )
        .catch(err => res.sendStatus(500)),
    );

  apiV2.get("/", (req, res) => {
    const queryKeys = Object.keys(req.query);

    const result =
      queryKeys.length === 0
        ? findAll(db)
        : queryKeys.length === 1
          ? findByArg(db, <any>queryKeys[0], req.query[queryKeys[0]])
          : Promise.reject("invalid-query");

    result
      .then(contacts => res.json(contacts))
      .catch(
        err =>
          err === "invalid-query" ? res.sendStatus(400) : res.sendStatus(500),
      );
  });

  return apiV2;
};
