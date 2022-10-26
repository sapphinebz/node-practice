import { MonoTypeOperatorFunction } from "rxjs";
import http from "http";
import { filter } from "rxjs/operators";
import { ClientMessage } from "./http-create-server";
import url from "url";

export function whenQuery(
  predicate: (queryObject: any) => boolean
): MonoTypeOperatorFunction<ClientMessage> {
  return filter(({ request }) => {
    return request.url !== undefined && predicate(getQueryObject(request));
  });
}

export function getQueryObject(request: http.IncomingMessage) {
  if (request.url !== undefined) {
    return url.parse(request.url, true).query;
  }
  return {};
}
