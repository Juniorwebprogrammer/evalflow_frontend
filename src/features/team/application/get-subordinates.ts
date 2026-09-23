import type { Subordinate } from "@/features/team/domain/team";
import type { TeamRepository } from "@/features/team/domain/team-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists the direct reports of a user via the backend `GET /team/{userId}/subordinates`. */
export class GetSubordinates {
  constructor(private readonly team: TeamRepository) {}

  async execute(userId: number, accessToken: string): Promise<Subordinate[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new DomainError("El identificador del empleado no es válido", 400);
    }

    return this.team.getSubordinates(userId, accessToken);
  }
}
