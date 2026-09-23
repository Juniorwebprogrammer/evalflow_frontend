import type {
  AssignDepartmentInput,
  AssignDepartmentResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Assigns (or unassigns) an employee's department via the backend
 * `PUT /team/{userId}/department`.
 */
export class AssignDepartment {
  constructor(private readonly team: TeamRepository) {}

  async execute(
    input: AssignDepartmentInput,
    accessToken: string,
  ): Promise<AssignDepartmentResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(input.UserId) || input.UserId <= 0) {
      throw new DomainError("El identificador del empleado no es válido", 400);
    }
    if (
      input.DepartmentId !== null &&
      (!Number.isInteger(input.DepartmentId) || input.DepartmentId <= 0)
    ) {
      throw new DomainError("El identificador del departamento no es válido", 400);
    }

    return this.team.assignDepartment(input, accessToken);
  }
}
