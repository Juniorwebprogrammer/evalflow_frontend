"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyFeatures } from "@/features/auth/presentation/api/auth-client";

export const MY_FEATURES_QUERY_KEY = ["my-features"] as const;

/** Reads the caller's role, its granted features, and its description (backend `Auth/my-features`). */
export function useMyFeatures() {
  return useQuery({
    queryKey: MY_FEATURES_QUERY_KEY,
    queryFn: fetchMyFeatures,
  });
}
