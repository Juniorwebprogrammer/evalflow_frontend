"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOrgChart } from "@/features/team/presentation/api/team-client";

export const ORG_CHART_QUERY_KEY = ["org-chart"] as const;

/** Reads the full reporting graph (see {@link fetchOrgChart}). */
export function useOrgChart() {
  return useQuery({
    queryKey: ORG_CHART_QUERY_KEY,
    queryFn: fetchOrgChart,
  });
}
