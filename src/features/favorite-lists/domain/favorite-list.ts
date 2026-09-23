/**
 * Favorite list entities — a caller's personal, named collections of
 * templates. Request bodies map 1:1 to the backend `Features/FavoriteLists`
 * contracts (`POST /favorite-lists`, `PUT /favorite-lists/{id}`).
 */
export interface FavoriteListInput {
  Nombre: string;
  Descripcion?: string | null;
}

/** Mirrors the backend `POST /favorite-lists` success response. */
export interface CreateFavoriteListResult {
  message: string;
  favoriteListId: number;
}

/** Mirrors the backend generic `{ Message }` response returned by update/delete/toggle. */
export interface FavoriteListActionResult {
  message: string;
}

/**
 * Mirrors the backend favorite-list DTO, returned by `GET /favorite-lists`.
 * The exact shape wasn't published by the backend snippet — the HTTP
 * repository maps it defensively. `templateIds` is what lets the UI show
 * which templates already belong to a list without a separate
 * "list details" endpoint; it defaults to `[]` if the backend doesn't send it.
 */
export interface FavoriteList {
  id: number;
  nombre: string;
  descripcion: string | null;
  templateIds: number[];
}
