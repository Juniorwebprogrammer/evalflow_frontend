"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCycleClarifications } from "@/features/clarifications/presentation/api/clarification-client";

export function cycleClarificationsQueryKey(cycleId: number) {
  return ["cycle-clarifications", cycleId] as const;
}

export function useCycleClarifications(cycleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cycleClarificationsQueryKey(cycleId),
    queryFn: () => fetchCycleClarifications(cycleId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
  });
}
