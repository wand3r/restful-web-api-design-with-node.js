import { connect, Db } from "mongodb";
import { mongoDbUri } from "./config";
import * as contacts from "./contacts-mongodb-repository";
import { Contact } from "../chapter-3/contacts";
import { tryCatch, insert } from "ramda";
import { insertOrReplace } from "./contacts-mongodb-repository";
import { omit } from "lodash";

let db: Db = undefined;
const contact: Contact = {
  firstname: "Johnr",
  lastname: "Douglas",
  title: "Mr.",
  company: "Dev Inc.",
  jobtitle: "Developer",
  primarycontactnumber: "+359777223344",
  othercontactnumbers: [],
  primaryemailaddress: "john.douglas@xyz.com",
  emailaddresses: ["j.douglas@xyz.com"],
  groups: ["Dev"],
};

beforeAll(() =>
  connect(mongoDbUri).then(_db => {
    db = _db;
  }),
);

afterEach(() => db.collection("contacts").deleteMany({}));

test("Insert new contact", () => {
  expect.assertions(1);
  return contacts
    .insertOrReplace(db, contact.primarycontactnumber, contact)
    .then(result => expect(result).toBe("inserted"));
});

test("Replace existing contact", () => {
  expect.assertions(1);
  return contacts
    .insertOrReplace(db, contact.primarycontactnumber, contact)
    .then(x => insertOrReplace(db, contact.primarycontactnumber, contact))
    .then(result => expect(result).toBe("replaced"));
});

test("Delete not existing contact", () => {
  expect.assertions(1);
  return contacts
    .remove(db, contact.primarycontactnumber)
    .then(result => expect(result).toBe("not-found"));
});

test("Delete existing contact", () => {
  expect.assertions(1);
  return contacts
    .insertOrReplace(db, contact.primarycontactnumber, contact)
    .then(result => contacts.remove(db, contact.primarycontactnumber))
    .then(result => expect(result).toBe("removed"));
});

test("Find not existing contact", () => {
  expect.assertions(1);
  return contacts
    .findByNumber(db, contact.primarycontactnumber)
    .then(contact => expect(contact).toBeNull());
});

test("Find existing contact", () => {
  expect.assertions(1);
  return contacts
    .insertOrReplace(db, contact.primarycontactnumber, contact)
    .then(result => contacts.findByNumber(db, contact.primarycontactnumber))
    .then(_contact => expect(omit(_contact, "_id")).toEqual(contact));
});

test("Find all contacts", () => {
  expect.assertions(1);
  const contact2 = { ...contact, primarycontactnumber: "+359777223345" };
  return contacts
    .insertOrReplace(db, contact.primarycontactnumber, contact)
    .then(result =>
      insertOrReplace(db, contact2.primarycontactnumber, contact2),
    )
    .then(result => contacts.findAll(db))
    .then(_contacts =>
      expect(_contacts.map(x => omit(x, "_id"))).toEqual([contact, contact2]),
    );
});

test("Find by args contacts", () => {
  expect.assertions(1);
  const contact2 = {
    ...contact,
    primarycontactnumber: "+359777223346",
    groups: [],
  };
  const contact3 = { ...contact, primarycontactnumber: "+359777223345" };
  return Promise.all(
    [contact, contact2, contact3].map(x =>
      insertOrReplace(db, x.primarycontactnumber, x),
    ),
  )
    .then(result => contacts.findByArg(db, "groups", "Dev"))
    .then(_contacts =>
      expect(_contacts.map(x => omit(x, "_id"))).toEqual([contact, contact3]),
    );
});
