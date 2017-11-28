import { Db } from "mongodb";
import { UpdateUser, User, FindUser, DeleteUser } from "./model";
import { InsertUser } from "./index";
import { ObjectId } from "bson";
import * as _ from "lodash";

const usersCollection = (db: Db) => db.collection<User>("users");

const removeNilProps = (obj: any) => _.omitBy(obj, _.isNil);

export const findUser: (db: Db) => FindUser = db => ({ name, id }) =>
  usersCollection(db).findOne(
    removeNilProps({ name, _id: id && new ObjectId(id) }),
  );

export const insertUser: (db: Db) => InsertUser = db => user =>
  usersCollection(db)
    .insertOne(user)
    .then(x => <string>x.insertedId.valueOf());

export const updateUser: (db: Db) => UpdateUser = db => (id, user) =>
  usersCollection(db)
    .updateOne({ _id: new ObjectId(id) }, user, { upsert: false })
    .then(result => (result.modifiedCount > 0 ? "updated" : "not-found"));

export const deleteUser: (db: Db) => DeleteUser = db => id =>
  usersCollection(db)
    .deleteOne({ _id: new ObjectId(id) })
    .then(result => (result.deletedCount > 0 ? "deleted" : "not-found"));
