import { Express, RequestHandler } from "express";
import * as passport from "passport";
import { OAuth2Strategy as GoogleAuthStrategy } from "passport-google-oauth";
import { BasicStrategy } from "passport-http";
import { User, FindUser, verifyPassword, isAuthorized } from "./users";

export const enableBasicAuthentication = (
  server: Express,
  findUser: FindUser,
) => {
  const basicStrategy = new BasicStrategy((userName, password, done) =>
    findUser({ name: userName })
      .then(user => {
        if (user && verifyPassword(user, password)) done(null, user);
        else done(null, false);
      })
      .catch(done),
  );
  // server.use(basicAuth(userExist(db)));
  server.use(passport.initialize());
  passport.use(basicStrategy);
};

export const authorizationMiddleware: (
  role: string,
) => RequestHandler = role => (req, res, next) => {
  if (req.user && isAuthorized(<User>req.user, role)) next();
  else res.sendStatus(403);
};

export const basicAuthMiddleware = () =>
  passport.authenticate("basic", { session: false });

export const enableGoogleOAuthAuthentication = (server: Express) => {
  const googleOAuthStrategy = new GoogleAuthStrategy(
    {
      clientID:
        "438203099277-bgjbg9668hmf441or4nohk1k6p2r5kpr.apps.googleusercontent.com",
      clientSecret: "faHCohN-zekKZr1lT6v9ELUA",
      callbackURL: "http://localhost:3000/login/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    },
  );
  server.use(passport.initialize());
  server.use(passport.session());
  passport.use(googleOAuthStrategy);

  server.get(
    "/login/google",
    passport.authenticate("google", { scope: ["profile"], session: true }),
  );

  server.get(
    "/login/google/callback",
    passport.authenticate("google", {
      failureRedirect: "http://localhost:3001",
    }),
    (req, res, next) => {
      res.redirect("http://localhost:3001");
    },
  );

  server.get("/logout", (req, res) => {
    req.logout();
  });

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
