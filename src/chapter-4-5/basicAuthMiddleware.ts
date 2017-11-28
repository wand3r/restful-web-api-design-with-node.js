import * as extractCredentialsFromRequest from "basic-auth";
import { RequestHandler } from "express-serve-static-core";
import { FindUser, verifyPassword } from "./users";

export const basicAuth: (findUser: FindUser) => RequestHandler = findUser => (
  req,
  res,
  next,
) => {
  const credentials = extractCredentialsFromRequest(req);

  if (credentials === undefined) {
    res.setHeader("WWW-Authenticate", "Basic");
    res.sendStatus(401);
    return;
  }

  findUser({ name: credentials.name })
    .then(
      user =>
        user && verifyPassword(user, credentials.pass)
          ? next()
          : res.sendStatus(401),
    )
    .catch(err => next(err));
};
