"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyClarifications } from "@/features/clarifications/presentation/api/clarification-client";

export const MY_CLARIFICATIONS_QUERY_KEY = ["clarifications", "mine"] as const;

export function useMyClarifications() {
  return useQuery({
    queryKey: MY_CLARIFICATIONS_QUERY_KEY,
    queryFn: fetchMyClarifications,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
