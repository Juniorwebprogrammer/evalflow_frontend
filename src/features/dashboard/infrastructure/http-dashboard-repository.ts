import "server-only";
import type { DashboardStats, DashboardActiveCycle } from "@/features/dashboard/domain/dashboard-stats";
import type { DashboardRepository } from "@/features/dashboard/domain/dashboard-repository";
import { BackendClient } from "@/core/http/backend-client";

/** Raw backend `DashboardActiveCycleDto` (PascalCase, tolerant to variations). */
interface DashboardActiveCycleDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  FechaInicio?: string;
  fechaInicio?: string;
  FechaFin?: string;
  fechaFin?: string;
  TotalSubmissions?: number;
  totalSubmissions?: number;
  CompletedCount?: number;
  completedCount?: number;
  PendingCount?: number;
  pendingCount?: number;
}

/** Raw backend `DashboardStatsDto` (PascalCase, tolerant to variations). */
interface DashboardStatsDto {
  ActiveEmployeesCount?: number;
  activeEmployeesCount?: number;
  DepartmentsCount?: number;
  departmentsCount?: number;
  ActiveCyclesCount?: number;
  activeCyclesCount?: number;
  ActiveCycle?: DashboardActiveCycleDto | null;
  activeCycle?: DashboardActiveCycleDto | null;
  TotalPendingSubmissions?: number;
  totalPendingSubmissions?: number;
  TotalCompletedSubmissions?: number;
  totalCompletedSubmissions?: number;
}

function mapActiveCycle(dto: DashboardActiveCycleDto): DashboardActiveCycle {
  return {
    id: dto.Id ?? dto.id ?? 0,
    nombre: dto.Nombre ?? dto.nombre ?? "",
    fechaInicio: dto.FechaInicio ?? dto.fechaInicio ?? "",
    fechaFin: dto.FechaFin ?? dto.fechaFin ?? "",
    totalSubmissions: dto.TotalSubmissions ?? dto.totalSubmissions ?? 0,
    completedCount: dto.CompletedCount ?? dto.completedCount ?? 0,
    pendingCount: dto.PendingCount ?? dto.pendingCount ?? 0,
  };
}

function mapStats(dto: DashboardStatsDto): DashboardStats {
  const activeCycle = dto.ActiveCycle ?? dto.activeCycle ?? null;

  return {
    activeEmployeesCount: dto.ActiveEmployeesCount ?? dto.activeEmployeesCount ?? 0,
    departmentsCount: dto.DepartmentsCount ?? dto.departmentsCount ?? 0,
    activeCyclesCount: dto.ActiveCyclesCount ?? dto.activeCyclesCount ?? 0,
    activeCycle: activeCycle ? mapActiveCycle(activeCycle) : null,
    totalPendingSubmissions: dto.TotalPendingSubmissions ?? dto.totalPendingSubmissions ?? 0,
    totalCompletedSubmissions: dto.TotalCompletedSubmissions ?? dto.totalCompletedSubmissions ?? 0,
  };
}

export class HttpDashboardRepository implements DashboardRepository {
  constructor(private readonly client: BackendClient) {}

  async getStats(accessToken: string): Promise<DashboardStats> {
    const dto = await this.client.request<DashboardStatsDto>("/dashboard/stats", {
      accessToken,
    });

    return mapStats(dto ?? {});
  }
}
