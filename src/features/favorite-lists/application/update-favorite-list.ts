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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(id) || id <= 0) {
      throw new DomainError("El identificador de la lista no es válido", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre de la lista es obligatorio", 400);
    }

    return this.favoriteLists.update(
      id,
      { Nombre: input.Nombre.trim(), Descripcion: input.Descripcion?.trim() || null },
      accessToken,
    );
  }
}
