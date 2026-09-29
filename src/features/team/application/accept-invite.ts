import type {
  AcceptInviteInput,
  AcceptInviteResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Completes an employee invitation via the backend `POST /team/accept-invite`.
 * Public flow — no session required, the invitation token authorizes the
 * request.
 */
export class AcceptInvite {
  constructor(private readonly team: TeamRepository) {}

  async execute(input: AcceptInviteInput): Promise<AcceptInviteResult> {
    if (!input.Token.trim()) {
      throw new DomainError("The invitation link is not valid.", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("First name is required.", 400);
    }
    if (!input.Apellidos.trim()) {
      throw new DomainError("Last name is required.", 400);
    }
    if (input.Password.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400,
      );
    }

    return this.team.acceptInvite({
      Token: input.Token,
      Nombre: input.Nombre.trim(),
      Apellidos: input.Apellidos.trim(),
      Password: input.Password,
    });
  }
}
