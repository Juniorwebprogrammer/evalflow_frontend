"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompletedSubmissions } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";

export const COMPLETED_SUBMISSIONS_QUERY_KEY = ["submissions", "completed"] as const;

/**
 * Reads the caller's completed submissions (backend
 * `GET /evaluation-submissions/completed`). Always refetches on mount, same
 * reasoning as `usePendingSubmissions`.
 */
export function useCompletedSubmissions() {
  return useQuery({
    queryKey: COMPLETED_SUBMISSIONS_QUERY_KEY,
    queryFn: fetchCompletedSubmissions,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
