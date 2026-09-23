"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPendingSubmissions } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";

export const PENDING_SUBMISSIONS_QUERY_KEY = ["submissions", "pending"] as const;

/**
 * Reads the caller's pending submissions (backend
 * `GET /evaluation-submissions/pending`). Always refetches on mount —
 * unlike most lists in this app, this one needs to reflect submissions an
 * RRHH admin may have just generated in a different screen/session, so the
 * shared `QueryClientProvider`'s 60s `staleTime` would otherwise show a
 * stale (possibly empty) list until it expires.
 */
export function usePendingSubmissions() {
  return useQuery({
    queryKey: PENDING_SUBMISSIONS_QUERY_KEY,
    queryFn: fetchPendingSubmissions,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
