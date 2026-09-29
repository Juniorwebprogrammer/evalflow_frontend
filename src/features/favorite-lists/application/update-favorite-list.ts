import type {
  FavoriteListInput,
  FavoriteListActionResult,
} from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { DomainError } from "@/core/errors/errors";

/** Updates a favorite list via the backend `PUT /favorite-lists/{id}`. */
export class UpdateFavoriteList {
  constructor(private readonly favoriteLists: FavoriteListRepository) {}

  async execute(
    id: number,
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<FavoriteListActionResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("The list ID is invalid", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("The list name is required", 400);
    }

    return this.favoriteLists.update(
      id,
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
