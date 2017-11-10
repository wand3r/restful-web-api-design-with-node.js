import * as xml2js from "xml2js";

const builder = new xml2js.Builder();

export const stringify = (obj: any) => builder.buildObject(obj);
