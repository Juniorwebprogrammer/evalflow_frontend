"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCycleSubmissions } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";

export function cycleSubmissionsQueryKey(cycleId: number) {
  return ["cycle-submissions", cycleId] as const;
}

/**
 * Lists every submission of a cycle (Owner/Rrhh only), backend
 * `GET /evaluation-cycles/{cycleId}/submissions`. Always refetches on
 * mount, same reasoning as `usePendingSubmissions` — this list needs to
 * reflect submissions just generated in the same visit.
 */
export function useCycleSubmissions(cycleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cycleSubmissionsQueryKey(cycleId),
    queryFn: () => fetchCycleSubmissions(cycleId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
  });
}
