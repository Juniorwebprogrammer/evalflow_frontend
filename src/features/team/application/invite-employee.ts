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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    const required: Array<[keyof InviteEmployeeInput, string]> = [
      ["Nombre", "El nombre es obligatorio"],
      ["Apellidos", "Los apellidos son obligatorios"],
      ["Email", "El correo electrónico es obligatorio"],
      ["Rol", "El rol es obligatorio"],
    ];

    for (const [field, message] of required) {
      if (!String(input[field] ?? "").trim()) {
        throw new DomainError(message, 400);
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email)) {
      throw new DomainError("El correo electrónico no es válido", 400);
    }

    return this.team.invite(input, accessToken);
  }
}
