import { Contact } from "./../chapter-3/contacts";
import * as _ from "lodash";
import { connect } from "mongodb";
import { mongoDbUri } from "./config";

const generateContacts = (count: number) =>
  _.range(count).map(x => ({
    firstname: "Johnr",
    lastname: "Douglas",
    title: "Mr.",
    company: "Dev Inc.",
    jobtitle: "Developer",
    primarycontactnumber: `+${x}`,
    othercontactnumbers: [],
    primaryemailaddress: "john.douglas@xyz.com",
    emailaddresses: ["j.douglas@xyz.com"],
    groups: ["Dev"],
  }));

const populateContacts = (count: number) =>
  connect(mongoDbUri).then(db =>
    db
      .collection("contacts")
      .insertMany(generateContacts(count))
      .catch(err => console.log("Something goes wrong"))
      .then(() => db.close()),
  );

populateContacts(1000);
