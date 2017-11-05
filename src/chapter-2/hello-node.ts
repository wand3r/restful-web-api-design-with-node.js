import * as http from "http";
import { RequestHandler } from "./http-types";

const port = 8180;

const handleRequest: RequestHandler = (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/plain",
  });
  response.end("Hello World. Are you restless to go restful?\n");
  console.log("hello-node.js was requested");
};

http.createServer(handleRequest).listen(port, "127.0.0.1");

console.log(`Started Node.js http server at http://127.0.0.1:${port}`);
