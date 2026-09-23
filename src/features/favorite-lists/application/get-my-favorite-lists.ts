import type { FavoriteList } from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists the caller's own favorite lists via the backend `GET /favorite-lists`. */
export class GetMyFavoriteLists {
  constructor(private readonly favoriteLists: FavoriteListRepository) {}

  async execute(accessToken: string): Promise<FavoriteList[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.favoriteLists.listMine(accessToken);
  }
}
