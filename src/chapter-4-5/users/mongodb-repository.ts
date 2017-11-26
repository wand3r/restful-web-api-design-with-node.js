import { Db } from "mongodb";
import { User, UserExist } from "./model";

const usersCollection = "users";

export const userExist: (db: Db) => UserExist = db => (name, password) =>
  db
    .collection<User>(usersCollection)
    .findOne({ name, password })
    .then(contact => contact !== null);
