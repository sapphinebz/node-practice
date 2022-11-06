import { httpGet } from "../../../http/server/http-get";
import { EachPk_Response } from "./model";

export function httpPokemonByUrl(url: string) {
  return httpGet<EachPk_Response>(url, (chunks) => JSON.parse(chunks));
}
