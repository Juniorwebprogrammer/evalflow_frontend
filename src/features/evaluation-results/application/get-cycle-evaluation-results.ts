import type { EvaluationResultSummary } from "@/features/evaluation-results/domain/evaluation-result";
import type { EvaluationResultRepository } from "@/features/evaluation-results/domain/evaluation-result-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every result of a completed cycle (Owner/RRHH only). */
export class GetCycleEvaluationResults {
  constructor(private readonly results: EvaluationResultRepository) {}

  async execute(cycleId: number, accessToken: string): Promise<EvaluationResultSummary[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.results.getByCycle(cycleId, accessToken);
  }
}
