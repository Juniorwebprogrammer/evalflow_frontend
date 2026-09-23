import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface FavoriteListResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  templateIds: number[];
}

/** Lists the caller's own favorite lists via our own route handler. */
export async function listMyFavoriteLists(): Promise<FavoriteListResponse[]> {
  const res = await fetch("/api/favorite-lists", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as FavoriteListResponse[];
}

export interface FavoriteListFormInput {
  nombre: string;
  descripcion?: string;
}

export interface CreateFavoriteListResponse {
  message: string;
  favoriteListId: number;
}

/** Creates a favorite list via our own route handler. */
export async function createFavoriteList(
  input: FavoriteListFormInput,
): Promise<CreateFavoriteListResponse> {
  const res = await fetch("/api/favorite-lists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateFavoriteListResponse;
}

export interface FavoriteListMessageResponse {
  message: string;
}

/** Updates a favorite list via our own route handler. */
export async function updateFavoriteList(
  id: number,
  input: FavoriteListFormInput,
): Promise<FavoriteListMessageResponse> {
  const res = await fetch(`/api/favorite-lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as FavoriteListMessageResponse;
}

/** Deletes a favorite list via our own route handler. */
export async function deleteFavoriteList(
  id: number,
): Promise<FavoriteListMessageResponse> {
  const res = await fetch(`/api/favorite-lists/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as FavoriteListMessageResponse;
}

/** Toggles whether a template belongs to a favorite list via our own route handler. */
export async function toggleTemplateInList(
  listId: number,
  templateId: number,
): Promise<FavoriteListMessageResponse> {
  const res = await fetch(
    `/api/favorite-lists/${listId}/templates/${templateId}/toggle`,
    { method: "PUT" },
  );
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as FavoriteListMessageResponse;
}
