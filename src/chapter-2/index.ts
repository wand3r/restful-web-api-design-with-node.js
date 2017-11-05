import * as http from "http";
import { handleRequest } from "./http-module";

const port = 8180;

http.createServer(handleRequest).listen(port, "localhost");

console.log("Started Node.js http server at http://localhost:" + port);
