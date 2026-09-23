import type { Employee } from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Lists every employee of the caller's company via the backend
 * `GET /Team/list`. Restricted to Owner, RRHH and Administrator on the
 * backend — a caller without those roles gets the backend's own 403.
 */
export class GetEmployees {
  constructor(private readonly team: TeamRepository) {}

  async execute(accessToken: string): Promise<Employee[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.team.getEmployees(accessToken);
  }
}
