import type {
  AssignSuperiorInput,
  AssignSuperiorResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Assigns (or unassigns) an employee's direct superior via the backend
 * `PUT /team/{userId}/superior`. The backend also guards against self-superior
 * and circular hierarchies; this mirrors the cheap self-superior check for
 * fast feedback without a round trip.
 */
export class AssignSuperior {
  constructor(private readonly team: TeamRepository) {}

  async execute(
    input: AssignSuperiorInput,
    accessToken: string,
  ): Promise<AssignSuperiorResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(input.UserId) || input.UserId <= 0) {
      throw new DomainError("Invalid employee ID.", 400);
    }
    if (
      input.SuperiorId !== null &&
      (!Number.isInteger(input.SuperiorId) || input.SuperiorId <= 0)
    ) {
      throw new DomainError("Invalid manager ID.", 400);
    }
    if (input.UserId === input.SuperiorId) {
      throw new DomainError("An employee can't be their own manager.", 400);
    }

    return this.team.assignSuperior(input, accessToken);
  }
}
