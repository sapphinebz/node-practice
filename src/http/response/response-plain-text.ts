import http from "http";

export function responsePlainText(response: http.ServerResponse, text: string) {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/plain");
  response.end(text);
}
