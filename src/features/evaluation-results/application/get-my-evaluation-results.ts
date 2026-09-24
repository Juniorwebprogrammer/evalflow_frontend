import type { EvaluationResultSummary } from "@/features/evaluation-results/domain/evaluation-result";
import type { EvaluationResultRepository } from "@/features/evaluation-results/domain/evaluation-result-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists the caller's own evaluation results. */
export class GetMyEvaluationResults {
  constructor(private readonly results: EvaluationResultRepository) {}

  async execute(accessToken: string): Promise<EvaluationResultSummary[]> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }

    return this.results.getMine(accessToken);
  }
}
