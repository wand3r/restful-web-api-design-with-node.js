import * as http from "http";
import { handleRequest } from "./http-module";
import * as TypeMoq from "typemoq";

describe("handle request", () => {
  it("Get method", () => {
    const responseMock = TypeMoq.Mock.ofType<http.ServerResponse>();
    const requestMock = TypeMoq.Mock.ofType<http.IncomingMessage>();

    requestMock.setup(x => x.method).returns(() => "GET");

    handleRequest(requestMock.object, responseMock.object);

    responseMock.verify(
      x =>
        x.writeHead(200, {
          "Content-Type": "text/plain",
        }),
      TypeMoq.Times.once(),
    );
    responseMock.verify(x => x.end("GET Request\n"), TypeMoq.Times.once());
  });
});
