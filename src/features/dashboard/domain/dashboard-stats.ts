/**
 * Aggregated numbers for the dashboard home. Mirrors the backend
 * `DashboardStatsDto`/`DashboardActiveCycleDto`, returned by
 * `GET /dashboard/stats`.
 */
export interface DashboardActiveCycle {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  totalSubmissions: number;
  completedCount: number;
  pendingCount: number;
}

export interface DashboardStats {
  activeEmployeesCount: number;
  departmentsCount: number;
  activeCyclesCount: number;
  activeCycle: DashboardActiveCycle | null;
  totalPendingSubmissions: number;
  totalCompletedSubmissions: number;
}
