import type { CycleComparisons } from "@/features/evaluation-comparisons/domain/evaluation-comparison";

export interface EvaluationComparisonRepository {
  getByCycle(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<CycleComparisons>;
}
