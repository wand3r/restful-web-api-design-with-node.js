import * as mongodb from "mongodb";
import { Contact } from "../chapter-3/contacts";
import { constructN, insert } from "ramda";

const contactsCollection = "contacts";

export const findByNumber = (
  db: mongodb.Db,
  primarycontactnumber: string,
): Promise<Contact | null> =>
  db
    .collection<Contact>(contactsCollection)
    .findOne({ primarycontactnumber })
    .catch(x => Promise.reject(Error("findByNumber internal error")));

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
