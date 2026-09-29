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
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid", 400);
    }
    if (evaluatedUserId !== null && (!Number.isInteger(evaluatedUserId) || evaluatedUserId <= 0)) {
      throw new DomainError("The given employee is not valid", 400);
    }

    return this.comparisons.getByCycle(cycleId, evaluatedUserId, accessToken);
  }
}
