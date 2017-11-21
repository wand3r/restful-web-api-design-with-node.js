import * as mongodb from "mongodb";
import { Contact } from "../chapter-3/contacts";
import { constructN, insert } from "ramda";

const uri = "mongodb://localhost/contacts";
export const db = () => mongodb.connect(uri);

const contactsCollection = "contacts";

type InsertOrReplaceResult = "inserted" | "replaced" | "error";

const parseResult = (
  result: mongodb.UpdateWriteOpResult,
): InsertOrReplaceResult =>
  result.upsertedCount === 1
    ? "inserted"
    : result.modifiedCount === 1 ? "replaced" : "error";

export const insertOrReplace = (
  db: mongodb.Db,
  contact: Contact,
): Promise<InsertOrReplaceResult> =>
  db
    .collection(contactsCollection)
    .replaceOne({ _id: contact.primarycontactnumber }, contact, {
      upsert: true,
    })
    .then(parseResult)
    .catch(x => "error" as InsertOrReplaceResult);

type RemoveResult = "removed" | "not-found" | "error";

export const remove = (
  db: mongodb.Db,
  primarycontactnumber: string,
): Promise<RemoveResult> =>
  db
    .collection(contactsCollection)
    .deleteOne({ name: primarycontactnumber })
    .then(x => (x.deletedCount === 1 ? "removed" : "not-found"))
    .catch(err => "error" as RemoveResult);
