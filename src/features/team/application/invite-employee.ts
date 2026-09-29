import type {
  InviteEmployeeInput,
  InviteEmployeeResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Invites an employee to the organization via the backend `Team/invite`
 * endpoint. Validates the payload before delegating to the team repository.
 */
export class InviteEmployee {
  constructor(private readonly team: TeamRepository) {}

  async execute(
    input: InviteEmployeeInput,
    accessToken: string,
  ): Promise<InviteEmployeeResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }

    const required: Array<[keyof InviteEmployeeInput, string]> = [
      ["Nombre", "First name is required."],
      ["Apellidos", "Last name is required."],
      ["Email", "Email is required."],
      ["Rol", "Role is required."],
    ];

    for (const [field, message] of required) {
      if (!String(input[field] ?? "").trim()) {
        throw new DomainError(message, 400);
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email)) {
      throw new DomainError("Enter a valid email address.", 400);
    }

    return this.team.invite(input, accessToken);
  }
}
