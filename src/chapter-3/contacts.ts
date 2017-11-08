import * as fs from "fs";
import * as _ from "lodash";

type Contact = {
  firstname: string;
  lastname: string;
  title: string;
  company: string;
  jobtitle: string;
  primarycontactnumber: string;
  othercontactnumbers: string[];
  primaryemailaddress: string;
  groups: string[];
};

type Contacts = {
  result: Contact[];
};

const readContacts: () => Contacts = JSON.parse(
  fs.readFileSync("./data/contacts.json", "utf-8"),
);

export const list: () => Contacts = readContacts;

export const query: (number: string) => Contact | undefined = number =>
  queryByArg("primarycontactnumber", number);

export const queryByArg: <T extends keyof Contact>(
  arg: T,
  value: Contact[T],
) => Contact | undefined = (arg, value) =>
  readContacts().result.find(x => x[arg] === value);

export const listGroups: () => string[] = _.flow(
  () => readContacts().result,
  contacts => _.flatMap(contacts, contact => contact.groups),
  groups => _.uniq(groups),
);

export const getMembers: (group: string) => Contact[] = (group: string) =>
  readContacts().result.filter(contact => contact.groups.includes(group));
