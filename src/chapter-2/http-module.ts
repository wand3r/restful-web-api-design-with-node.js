import * as http from "http";
import { RequestHandler } from "./http-types";

const plainTextResponse = (text: string) => (response: http.ServerResponse) => {
  response.writeHead(200, {
    "Content-Type": "text/plain",
  });
  response.end(text);
};

const handleGetRequest = plainTextResponse("GET Request\n");
const handlePOSTRequest = plainTextResponse("POST Request\n");
const handlePUTRequest = plainTextResponse("PUT Request\n");
const handleDELETERequest = plainTextResponse("DELETE Request\n");
const handleHEADRequest = plainTextResponse("HEAD Request\n");

const handleBadRequest = (res: http.ServerResponse) => {
  res.writeHead(400, {
    "Content-Type": "text/plain",
  });
  res.end("Bad request\n");
};

export const handleRequest: RequestHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      handleGetRequest(res);
      break;
    case "POST":
      handlePOSTRequest(res);
      break;
    case "PUT":
      handlePUTRequest(res);
      break;
    case "DELETE":
      handleDELETERequest(res);
      break;
    case "HEAD":
      handleHEADRequest(res);
      break;
    default:
      handleBadRequest(res);
      break;
  }
  console.log("Request processing ended");
};
