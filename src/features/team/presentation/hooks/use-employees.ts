"use client";

import { useQuery } from "@tanstack/react-query";
import { listEmployees } from "@/features/team/presentation/api/team-client";

export const EMPLOYEES_QUERY_KEY = ["employees"] as const;

/** Reads the caller's company employee directory (backend `Team/list`). */
export function useEmployees() {
  return useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: listEmployees,
  });
}
