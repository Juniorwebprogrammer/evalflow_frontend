import { ApiError, parseMessage } from "@/shared/lib/api-error";

export interface DashboardActiveCycleResponse {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  totalSubmissions: number;
  completedCount: number;
  pendingCount: number;
}

export interface DashboardStatsResponse {
  activeEmployeesCount: number;
  departmentsCount: number;
  activeCyclesCount: number;
  activeCycle: DashboardActiveCycleResponse | null;
  totalPendingSubmissions: number;
  totalCompletedSubmissions: number;
}

/** Fetches the dashboard's aggregate stats via our own route handler. */
export async function fetchDashboardStats(): Promise<DashboardStatsResponse> {
  const res = await fetch("/api/dashboard/stats", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as DashboardStatsResponse;
}
