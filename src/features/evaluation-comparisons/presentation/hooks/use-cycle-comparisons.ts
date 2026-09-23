"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCycleComparisons } from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";

export function cycleComparisonsQueryKey(cycleId: number) {
  return ["cycle-comparisons", cycleId] as const;
}

export function useCycleComparisons(cycleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cycleComparisonsQueryKey(cycleId),
    queryFn: () => fetchCycleComparisons(cycleId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
  });
}
