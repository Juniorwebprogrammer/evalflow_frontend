"use client";

import { useQuery } from "@tanstack/react-query";
import { listJobPositions } from "@/features/job-positions/presentation/api/job-position-client";

export const JOB_POSITIONS_QUERY_KEY = ["job-positions"] as const;

/** Reads the caller's company job position list (backend `GET /job-positions`). */
export function useJobPositions() {
  return useQuery({
    queryKey: JOB_POSITIONS_QUERY_KEY,
    queryFn: listJobPositions,
  });
}
