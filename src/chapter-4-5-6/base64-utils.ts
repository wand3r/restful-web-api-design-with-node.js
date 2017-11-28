export const toBase64 = (str: string) => new Buffer(str).toString("base64");
export const fromBase64 = (str: string) => new Buffer(str, "base64").toString();
