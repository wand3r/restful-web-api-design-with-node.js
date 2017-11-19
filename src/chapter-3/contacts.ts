import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";

export type Contact = {
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

export const readContacts: () => Contacts = _.flow(
  () => path.join(__dirname, "data", "contacts.json"),
  filePath => fs.readFileSync(filePath, "utf-8"),
  fileContent => JSON.parse(fileContent),
);

export const list: () => Contacts = readContacts;

export const query: (number: string) => Contact | null = number =>
  queryByArg("primarycontactnumber", number);

export const queryByArg: <T extends keyof Contact>(
  arg: T,
  value: Contact[T],
) => Contact | null = (arg, value) =>
  readContacts().result.find(x => x[arg] === value) || null;

export const listGroups: () => string[] = _.flow(
  () => readContacts().result,
  contacts => _.flatMap(contacts, contact => contact.groups),
  groups => _.uniq(groups),
);

export const getMembers: (group: string) => Contact[] = (group: string) =>
  readContacts().result.filter(contact => contact.groups.includes(group));
