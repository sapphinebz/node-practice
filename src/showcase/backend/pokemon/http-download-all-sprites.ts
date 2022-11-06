import { concatMap, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { httpDownload } from "../../../http/http-download";
import { httpPaginatorPokemon } from "./http-paginator-pokemon";
import { httpPokemonByUrl } from "./http-pokemon-by-url";
import { EachPk_Response, Paginator } from "./model";

export function httpDownloadAllSprites(eachPk: EachPk_Response) {
  const spriteUrls = Object.entries(eachPk.sprites).filter(
    ([_, spriteUrl]) =>
      Boolean(spriteUrl) &&
      typeof spriteUrl === "string" &&
      spriteUrl.endsWith("png")
  );
  return from(spriteUrls).pipe(
    concatMap(([spriteName, spriteUrl]: [string, string]) => {
      return httpDownload(
        spriteUrl,
        `${__dirname}/images/${eachPk.name}/${spriteName}.png`
      );
    })
  );
}

export function httpDownloadAllSpritesByPaginator(paginator: Paginator) {
  return httpPaginatorPokemon(paginator).pipe(
    switchMap((response) => {
      return from(response.results).pipe(
        concatMap((result) => {
          return httpPokemonByUrl(result.url).pipe(
            switchMap((eachPk) => {
              return httpDownloadAllSprites(eachPk);
            })
          );
        })
      );
    })
  );
}
