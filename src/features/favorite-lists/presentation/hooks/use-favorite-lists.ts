"use client";

import { useQuery } from "@tanstack/react-query";
import { listMyFavoriteLists } from "@/features/favorite-lists/presentation/api/favorite-list-client";

export const FAVORITE_LISTS_QUERY_KEY = ["favorite-lists"] as const;

/** Reads the caller's own favorite lists (backend `GET /favorite-lists`). */
export function useFavoriteLists() {
  return useQuery({
    queryKey: FAVORITE_LISTS_QUERY_KEY,
    queryFn: listMyFavoriteLists,
  });
}
