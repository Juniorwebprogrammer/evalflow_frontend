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
      throw new DomainError("El enlace de invitación no es válido.", 400);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("El nombre es obligatorio", 400);
    }
    if (!input.Apellidos.trim()) {
      throw new DomainError("Los apellidos son obligatorios", 400);
    }
    if (input.Password.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
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
