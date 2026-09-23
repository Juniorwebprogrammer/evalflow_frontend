import type { EvaluationCycleActionResult } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import type { EvaluationCycleRepository } from "@/features/evaluation-cycles/domain/evaluation-cycle-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Generates the self/manager submissions for a cycle's assigned users, via
 * the backend `POST /evaluation-cycles/{cycleId}/generate-submissions`.
 */
export class GenerateSubmissions {
  constructor(private readonly cycles: EvaluationCycleRepository) {}

  async execute(
    cycleId: number,
    accessToken: string,
  ): Promise<EvaluationCycleActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.cycles.generateSubmissions(cycleId, accessToken);
  }
}
