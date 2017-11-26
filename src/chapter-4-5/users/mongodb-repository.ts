import { Db } from "mongodb";
import { User, UserExist, FindUser } from "./model";

const usersCollection = (db: Db) => db.collection<User>("users");

export const userExist: (db: Db) => UserExist = db => (name, password) =>
  usersCollection(db)
    .findOne({ name, password })
    .then(contact => contact !== null);

export const findUser: (db: Db) => FindUser = db => name =>
  usersCollection(db).findOne({ name });
