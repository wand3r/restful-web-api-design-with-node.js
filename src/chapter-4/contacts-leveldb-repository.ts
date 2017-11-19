import { fromEvent } from "rxjs/observable/fromEvent";
import "rxjs";
import { DbType, db } from "./leveldb";
import { Contact } from "../chapter-3/contacts";

type ContactsDbType = DbType<string, Contact>;

export const contactsDb: () => ContactsDbType = () =>
  db<string, Contact>("./contacts");

export const insertContacts = (db: ContactsDbType, contacts: Contact[]) => {
  const batchData = contacts.map(x => ({
    type: "put" as "put",
    key: x.primarycontactnumber,
    value: x,
  }));
  return db.batch(batchData);
};

export const deleteContacts = (db: ContactsDbType, keys: string[]) =>
  db.batch(keys.map(key => ({ type: "del" as "del", key })));

export const getContact = (db: ContactsDbType, key: string) => db.get(key);

export const streamContacts = (db: ContactsDbType) => {
  const stream = db.createReadStream();
  return fromEvent<{ key: string; value: Contact }>(stream, "data")
    .takeUntil(fromEvent(stream, "close"))
    .map(x => x.value);
};

export const notFound = (err: any) => err.type === "NotFoundError";
