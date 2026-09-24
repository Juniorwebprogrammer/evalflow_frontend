import type { Clarification } from "@/features/clarifications/domain/clarification";
import type { ClarificationRepository } from "@/features/clarifications/domain/clarification-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists a cycle's clarification requests with both answers (Owner/RRHH only). */
export class GetCycleClarifications {
  constructor(private readonly clarifications: ClarificationRepository) {}

  async execute(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<Clarification[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }
    if (evaluatedUserId !== null && (!Number.isInteger(evaluatedUserId) || evaluatedUserId <= 0)) {
      throw new DomainError("El empleado indicado no es válido", 400);
    }

    return this.clarifications.getByCycle(cycleId, evaluatedUserId, accessToken);
  }
}
