import * as express from "express";
import { Db } from "mongodb";
import {
  findByNumber,
  insertOrReplace,
  remove,
  findAll,
  findByArg,
  updateImage,
  getImage,
  removeImage,
  InvalidPagingParameter,
} from "./contacts-mongodb-repository";
import { CombineLatestSubscriber } from "rxjs/operators/combineLatest";
import { options } from "../utils";
import { contactsDb } from "./contacts-leveldb-repository";
import { cache } from "./cacheMiddleware";

export const apiV2 = (db: Db) => {
  const apiV2 = express.Router();

  apiV2.get("/", cache(10), (req, res) => {
    const queryKeys = Object.keys(req.query);
    //prettier-ignore
    const result: Promise<any> =
      queryKeys.length === 0 ? 
        findAll(db) : 
      queryKeys.includes("limit") || queryKeys.includes("page") ? 
        findAll(db, { limit: req.query.limit && parseInt(req.query.limit), page: req.query.page && parseInt(req.query.page) }) : 
      queryKeys.length === 1 ? 
        findByArg(db, <any>queryKeys[0], req.query[queryKeys[0]]) : 
      Promise.reject("invalid-query");

    result
      .then(contacts => res.json(contacts))
      .catch(
        err =>
          err === "invalid-query" || err instanceof InvalidPagingParameter
            ? res.sendStatus(400)
            : res.sendStatus(500),
      );
  });

  apiV2
    .route("/:number")
    .get((req, res) =>
      findByNumber(db, req.params.number)
        .then(contact => (contact ? res.json(contact) : res.sendStatus(404)))
        .catch(err => res.sendStatus(500)),
    )
    .put((req, res) => {
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
            deleted: () => res.sendStatus(200),
            "not-found": () => res.sendStatus(200),
          }),
        )
        .catch(err => res.sendStatus(500)),
    );

  apiV2
    .route("/:number/image")
    .get((req, res) =>
      getImage(db, req.params.number)
        .then(imgStream => {
          if (imgStream === undefined) {
            res.sendStatus(404);
            return;
          }
          res.setHeader("Content-Type", "image/jpeg");
          imgStream.on("error", () => res.sendStatus(500));
          imgStream.pipe(res);
        })
        .catch(err => res.sendStatus(500)),
    )
    .put((req, res) =>
      updateImage(db, req.params.number, req)
        .then(() => res.sendStatus(200))
        .catch(err => res.sendStatus(500)),
    )
    .delete((req, res) =>
      removeImage(db, req.params.number)
        .then(x => res.sendStatus(200))
        .catch(err => res.sendStatus(500)),
    );

  return apiV2;
};
