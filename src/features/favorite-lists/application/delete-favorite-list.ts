import type { FavoriteListActionResult } from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes a favorite list via the backend `DELETE /favorite-lists/{id}`. */
export class DeleteFavoriteList {
  constructor(private readonly favoriteLists: FavoriteListRepository) {}

  async execute(id: number, accessToken: string): Promise<FavoriteListActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador de la lista no es válido", 400);
    }

    return this.favoriteLists.remove(id, accessToken);
  }
}
