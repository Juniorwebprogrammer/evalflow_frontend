"use client";

import { useQuery } from "@tanstack/react-query";
import { listEvaluationCycles } from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";

export const EVALUATION_CYCLES_QUERY_KEY = ["evaluation-cycles"] as const;

/** Reads the caller's company evaluation cycles (backend `GET /evaluation-cycles`). */
export function useEvaluationCycles() {
  return useQuery({
    queryKey: EVALUATION_CYCLES_QUERY_KEY,
    queryFn: listEvaluationCycles,
  });
}
