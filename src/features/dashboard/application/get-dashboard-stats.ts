import type { DashboardStats } from "@/features/dashboard/domain/dashboard-stats";
import type { DashboardRepository } from "@/features/dashboard/domain/dashboard-repository";
import { DomainError } from "@/core/errors/errors";

/** Fetches the caller's company aggregate stats via the backend `GET /dashboard/stats`. */
export class GetDashboardStats {
  constructor(private readonly dashboard: DashboardRepository) {}

  async execute(accessToken: string): Promise<DashboardStats> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.dashboard.getStats(accessToken);
  }
}
