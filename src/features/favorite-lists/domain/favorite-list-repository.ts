import type {
  FavoriteList,
  FavoriteListInput,
  CreateFavoriteListResult,
  FavoriteListActionResult,
} from "@/features/favorite-lists/domain/favorite-list";

/** Port for favorite-list management. Implemented by the infrastructure layer. */
export interface FavoriteListRepository {
  /** Creates a favorite list owned by the caller. */
  create(
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<CreateFavoriteListResult>;

  /** Updates a favorite list's name/description. */
  update(
    id: number,
    input: FavoriteListInput,
    accessToken: string,
  ): Promise<FavoriteListActionResult>;

  /** Deletes a favorite list. */
  remove(id: number, accessToken: string): Promise<FavoriteListActionResult>;

  /** Lists the caller's own favorite lists. */
  listMine(accessToken: string): Promise<FavoriteList[]>;

  /** Toggles whether a template belongs to a favorite list. */
  toggleTemplate(
    listId: number,
    templateId: number,
    accessToken: string,
  ): Promise<FavoriteListActionResult>;
}
