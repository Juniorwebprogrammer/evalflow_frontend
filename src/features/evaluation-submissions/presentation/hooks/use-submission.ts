"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSubmission } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";

export function submissionQueryKey(id: number) {
  return ["submission", id] as const;
}

/** Reads a single submission's shell, backend `GET /evaluation-submissions/{id}`. */
export function useSubmission(id: number) {
  return useQuery({
    queryKey: submissionQueryKey(id),
    queryFn: () => fetchSubmission(id),
  });
}
