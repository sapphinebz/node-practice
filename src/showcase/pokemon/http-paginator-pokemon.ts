import { httpJsonGet } from "../../http/http-json.get";
import { Paginator, Pk_Response } from "./model";

export function httpPaginatorPokemon(paginator: Paginator) {
  return httpJsonGet<Pk_Response>(
    `https://pokeapi.co/api/v2/pokemon?limit=${paginator.limit}&offset=${paginator.offset}`
  );
}
