import type { DashboardStats } from "@/features/dashboard/domain/dashboard-stats";

/** Port for dashboard aggregates. Implemented by the infrastructure layer. */
export interface DashboardRepository {
  /** Fetches the caller's company aggregate stats for the dashboard home. */
  getStats(accessToken: string): Promise<DashboardStats>;
}
