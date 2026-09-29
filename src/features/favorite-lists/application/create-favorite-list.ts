import type {
  FavoriteListInput,
  CreateFavoriteListResult,
} from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { DomainError } from "@/core/errors/errors";

/** Creates a favorite list owned by the caller via the backend `POST /favorite-lists`. */
export class CreateFavoriteList {
  constructor(private readonly favoriteLists: FavoriteListRepository) {}

  async execute(
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<CreateFavoriteListResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("The list name is required", 400);
    }

    return this.favoriteLists.create(
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
