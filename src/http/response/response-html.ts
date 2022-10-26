import http from "http";

export function responseHTML(response: http.ServerResponse, html: string) {
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(html);
  response.end();
}
