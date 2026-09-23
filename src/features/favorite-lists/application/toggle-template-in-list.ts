import type { FavoriteListActionResult } from "@/features/favorite-lists/domain/favorite-list";
import type { FavoriteListRepository } from "@/features/favorite-lists/domain/favorite-list-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Toggles whether a template belongs to a favorite list, via the backend
 * `PUT /favorite-lists/{listId}/templates/{templateId}/toggle`.
 */
export class ToggleTemplateInList {
  constructor(private readonly favoriteLists: FavoriteListRepository) {}

  async execute(
    listId: number,
    templateId: number,
    accessToken: string,
  ): Promise<FavoriteListActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (
      !Number.isInteger(listId) ||
      listId <= 0 ||
      !Number.isInteger(templateId) ||
      templateId <= 0
    ) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.favoriteLists.toggleTemplate(listId, templateId, accessToken);
  }
}
