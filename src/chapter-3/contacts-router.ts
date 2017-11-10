import * as express from "express";
import * as xml from "./xml-utils";
import * as contacts from "./contacts";

export const router = express.Router();

router.get("/contacts", (req, res) => {
  const queryKeys = Object.keys(req.query);
  if (queryKeys.length === 0) {
    res.json(contacts.list());
  } else if (queryKeys.length === 1) {
    res.json(contacts.queryByArg(<any>queryKeys[0], req.query[queryKeys[0]]));
  } else {
    res.sendStatus(400);
  }
});

router.get("/contacts/:number", (req, res) => {
  res.send(contacts.query(req.params.number));
});

router.get("/groups", (req, res) => {
  const groups = contacts.listGroups();
  res.format({
    "application/json": () => res.send(groups),
    "text/xml": () => res.send(xml.stringify(groups)),
    default: () => res.status(406).send("Not Acceptable"),
  });
});

router.get("/groups/:name", (req, res) => {
  console.log();
  res.json(contacts.getMembers(req.params.name));
});
