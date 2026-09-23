"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/features/dashboard/presentation/api/dashboard-client";

export const DASHBOARD_STATS_QUERY_KEY = ["dashboard-stats"] as const;

/**
 * Reads the caller's company aggregate stats (backend `GET /dashboard/stats`).
 * `RealtimeProvider` invalidates this query whenever an `EvaluationCompleted`
 * SignalR event arrives, so it refreshes on its own while the dashboard is open.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: fetchDashboardStats,
  });
}
