import type { CompleteEvaluationCycleResult } from "@/features/evaluation-results/domain/evaluation-result";
import type { EvaluationResultRepository } from "@/features/evaluation-results/domain/evaluation-result-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Completes a cycle (Owner/RRHH): auto-completes pending forms with their
 * current answers and stores one result per employee. The backend refuses
 * while there are unaccepted imbalances.
 */
export class CompleteEvaluationCycle {
  constructor(private readonly results: EvaluationResultRepository) {}

  async execute(cycleId: number, accessToken: string): Promise<CompleteEvaluationCycleResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.results.completeCycle(cycleId, accessToken);
  }
}
