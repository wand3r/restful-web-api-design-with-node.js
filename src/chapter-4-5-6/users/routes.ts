import { Router } from "express";
import { Db } from "mongodb";
import { findUser, deleteUser, updateUser } from "./mongodb-repository";
import { options } from "../../utils";
import { insertUser } from "./index";

export const routes = (db: Db) => {
  const routes = Router();

  routes
    .route("/:id")
    .get((req, res) =>
      findUser(db)({ id: req.params.id })
        .then(user => (user ? res.json(user) : res.sendStatus(404)))
        .catch(() => res.sendStatus(500)),
    )
    .delete((req, res) =>
      deleteUser(db)(req.params.id)
        .then(result => res.sendStatus(200))
        .catch(() => res.sendStatus(500)),
    )
    .put((req, res) =>
      updateUser(db)(req.params.id, req.body)
        .then(result =>
          options(result, {
            updated: () => res.sendStatus(200),
            "not-found": () => res.sendStatus(404),
          }),
        )
        .catch(() => res.sendStatus(500)),
    );
  routes.route("/").post((req, res) =>
    insertUser(db)(req.body)
      .then(id => res.json({ id }))
      .catch(() => res.sendStatus(500)),
  );
  return routes;
};
