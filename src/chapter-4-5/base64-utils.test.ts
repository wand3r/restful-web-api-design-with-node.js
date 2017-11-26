import { fromBase64, toBase64 } from "./base64-utils";

test("toBase64", () => {
  expect(toBase64("admin:admin")).toBe("YWRtaW46YWRtaW4=");
});

test("fromBase64", () => {
  expect(fromBase64("YWRtaW46YWRtaW4=")).toBe("admin:admin");
});
