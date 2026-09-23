import type {
  ToggleUserStatusInput,
  ToggleUserStatusResult,
} from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Activates or deactivates an employee's account via the backend
 * `PUT /team/{userId}/status`. Restricted to Owner and RRHH on the backend —
 * it also rejects the caller deactivating their own account there.
 */
export class ToggleUserStatus {
  constructor(private readonly team: TeamRepository) {}

  async execute(
    input: ToggleUserStatusInput,
    accessToken: string,
  ): Promise<ToggleUserStatusResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(input.UserId) || input.UserId <= 0) {
      throw new DomainError("El identificador del empleado no es válido", 400);
    }

    return this.team.toggleUserStatus(input, accessToken);
  }
}
