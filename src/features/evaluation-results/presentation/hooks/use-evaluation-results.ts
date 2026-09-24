"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchCycleEvaluationResults,
  fetchMyEvaluationResults,
} from "@/features/evaluation-results/presentation/api/evaluation-result-client";

export const MY_EVALUATION_RESULTS_QUERY_KEY = ["evaluation-results", "mine"] as const;

export function cycleEvaluationResultsQueryKey(cycleId: number) {
  return ["evaluation-results", "cycle", cycleId] as const;
}

export function useMyEvaluationResults() {
  return useQuery({
    queryKey: MY_EVALUATION_RESULTS_QUERY_KEY,
    queryFn: fetchMyEvaluationResults,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useCycleEvaluationResults(cycleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cycleEvaluationResultsQueryKey(cycleId),
    queryFn: () => fetchCycleEvaluationResults(cycleId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
  });
}
