import type { CycleComparisons } from "@/features/evaluation-comparisons/domain/evaluation-comparison";
import type { EvaluationComparisonRepository } from "@/features/evaluation-comparisons/domain/evaluation-comparison-repository";
import { DomainError } from "@/core/errors/errors";

export class GetCycleComparisons {
  constructor(private readonly comparisons: EvaluationComparisonRepository) {}

  async execute(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<CycleComparisons> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }
    if (evaluatedUserId !== null && (!Number.isInteger(evaluatedUserId) || evaluatedUserId <= 0)) {
      throw new DomainError("El empleado indicado no es válido", 400);
    }

    return this.comparisons.getByCycle(cycleId, evaluatedUserId, accessToken);
  }
}
