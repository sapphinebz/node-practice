import { httpJsonGet } from "../../http/http-json.get";
import { EachPk_Response } from "./model";

export function httpPokemonByUrl(url: string) {
  return httpJsonGet<EachPk_Response>(url);
}
