import * as express from "express";
import { Db } from "mongodb";
import {
  findByNumber,
  insertOrReplace,
  remove,
  findAll,
} from "./contacts-mongodb-repository";
import { CombineLatestSubscriber } from "rxjs/operators/combineLatest";
import { options } from "../utils";

export const apiV2 = (db: Db) => {
  const apiV2 = express.Router();

  apiV2
    .route("/:number")
    .get((req, res) =>
      findByNumber(db, req.params.number)
        .then(contact => (contact ? res.json(contact) : res.sendStatus(404)))
        .catch(err => res.sendStatus(500)),
    )
    .put((req, res) => {
      if (req.params.name !== req.body.primarycontactnumber)
        res.sendStatus(422);
      else
        insertOrReplace(db, req.params.number, req.body)
          .then(result =>
            options(result, {
              inserted: () => res.sendStatus(201),
              replaced: () => res.sendStatus(200),
            }),
          )
          .catch(err => res.sendStatus(500));
    })
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

  apiV2.get("/", (req, res) =>
    findAll(db)
      .then(contacts => res.json(contacts))
      .catch(err => res.sendStatus(500)),
  );

  return apiV2;
};
