import * as extractCredentialsFromRequest from "basic-auth";
import { RequestHandler } from "express-serve-static-core";
import { UserExist } from "./users";

export const basicAuth: (
  userExist: UserExist,
) => RequestHandler = userExist => (req, res, next) => {
  const credentials = extractCredentialsFromRequest(req);

  if (credentials === undefined) {
    res.setHeader("WWW-Authenticate", "Basic");
    res.sendStatus(401);
    return;
  }

  userExist(credentials.name, credentials.pass)
    .then(userExist => (userExist ? next() : res.sendStatus(401)))
    .catch(err => next(err));
};
