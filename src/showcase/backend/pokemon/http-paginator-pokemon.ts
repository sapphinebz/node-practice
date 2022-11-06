import { httpGet } from "../../../http/server/http-get";
import { Paginator, Pk_Response } from "./model";

export function httpPaginatorPokemon(paginator: Paginator) {
  return httpGet<Pk_Response>(
    `https://pokeapi.co/api/v2/pokemon?limit=${paginator.limit}&offset=${paginator.offset}`,
    (chunks) => JSON.parse(chunks)
  );
}
