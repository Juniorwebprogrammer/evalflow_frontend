import type {
  AssignJobPositionInput,
  AssignJobPositionResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Assigns (or unassigns) an employee's job position (cargo) via the backend
 * `PUT /team/{userId}/job-position`.
 */
export class AssignJobPosition {
  constructor(private readonly team: TeamRepository) {}

  async execute(
    input: AssignJobPositionInput,
    accessToken: string,
  ): Promise<AssignJobPositionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(input.UserId) || input.UserId <= 0) {
      throw new DomainError("El identificador del empleado no es válido", 400);
    }
    if (
      input.JobPositionId !== null &&
      (!Number.isInteger(input.JobPositionId) || input.JobPositionId <= 0)
    ) {
      throw new DomainError("El identificador del cargo no es válido", 400);
    }

    return this.team.assignJobPosition(input, accessToken);
  }
}
