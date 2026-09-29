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
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(input.UserId) || input.UserId <= 0) {
      throw new DomainError("Invalid employee ID.", 400);
    }
    if (
      input.DepartmentId !== null &&
      (!Number.isInteger(input.DepartmentId) || input.DepartmentId <= 0)
    ) {
      throw new DomainError("Invalid department ID.", 400);
    }

    return this.team.assignDepartment(input, accessToken);
  }
}
