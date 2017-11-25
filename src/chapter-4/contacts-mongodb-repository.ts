import * as mongodb from "mongodb";
import { Contact } from "../chapter-3/contacts";
import * as Grid from "gridfs-stream";
import { mongoDbUri } from "./config";
import { Stream } from "stream";
import * as fs from "fs";
import * as path from "path";
import { ObjectID } from "bson";
import { connect, MongoError } from "mongodb";

const contactsCollection = "contacts";

export const findByNumber = (
  db: mongodb.Db,
  primarycontactnumber: string,
): Promise<Contact | null> =>
  db
    .collection<Contact>(contactsCollection)
    .findOne({ primarycontactnumber })
    .catch(x => Promise.reject(Error("findByNumber internal error")));

export const findByArg = (
  db: mongodb.Db,
  key: keyof Contact,
  value: any,
): Promise<Contact[]> =>
  db
    .collection<Contact>(contactsCollection)
    .find({ [key]: value })
    .toArray()
    .catch(err => Promise.reject("findByArgs internal error"));

export const findAll = (db: mongodb.Db) =>
  db
    .collection<Contact>(contactsCollection)
    .find({})
    .toArray()
    .catch(err => Promise.reject(Error("findAll internal error")));

export const insertOrReplace = (
  db: mongodb.Db,
  primarycontactnumber: string,
  contact: Contact,
): Promise<"inserted" | "replaced"> =>
  db
    .collection<Contact>(contactsCollection)
    .replaceOne({ primarycontactnumber }, contact, {
      upsert: true,
    })
    .then(result => {
      if (result.modifiedCount === 1) return "replaced";
      else if (result.upsertedCount === 1) return "inserted";
      else throw Error();
    })
    .catch(err => Promise.reject("insertOrReplace internal error"));

export const remove = (
  db: mongodb.Db,
  primarycontactnumber: string,
): Promise<"removed" | "not-found"> =>
  db
    .collection<Contact>(contactsCollection)
    .deleteOne({ primarycontactnumber })
    .then(x => (x.deletedCount === 1 ? "removed" : "not-found"))
    .catch(err => Promise.reject("remove internal error"));

export const updateImage = (
  db: mongodb.Db,
  primarycontactnumber: string,
  fileStream: Stream,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const gfs = Grid(db, mongodb);
    const pipe = fileStream.pipe(
      gfs.createWriteStream({
        _id: primarycontactnumber,
        filename: "image",
        mode: "w",
      }),
    );
    pipe.on("finish", resolve);
    pipe.on("error", reject);
  });

export const getImage = (
  db: mongodb.Db,
  primarycontactnumber: string,
): Promise<NodeJS.ReadableStream | undefined> => {
  const grid = Grid(db, mongodb);
  return db
    .collection("fs.files")
    .findOne({ _id: primarycontactnumber })
    .then(
      file =>
        file
          ? grid.createReadStream({
              _id: primarycontactnumber,
              filename: "image",
              mode: "r",
            })
          : undefined,
    );
};

export const removeImage = (db: mongodb.Db, primarycontactnumber: string) =>
  Promise.all([
    db.collection("fs.files").deleteOne({ _id: primarycontactnumber }),
    db.collection("fs.chunks").deleteMany({ files_id: primarycontactnumber }),
  ])
    .then(([res1, res2]) => {})
    .catch(err => Promise.reject("removeImage internal error"));
