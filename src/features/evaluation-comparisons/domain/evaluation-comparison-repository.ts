import type {
  AcceptDiscrepanciesInput,
  AcceptedDiscrepancy,
  CycleComparisons,
} from "@/features/evaluation-comparisons/domain/evaluation-comparison";

export interface EvaluationComparisonRepository {
  getByCycle(
    cycleId: number,
    evaluatedUserId: number | null,
    accessToken: string,
  ): Promise<CycleComparisons>;

  acceptDiscrepancies(
    cycleId: number,
    input: AcceptDiscrepanciesInput,
    accessToken: string,
  ): Promise<AcceptedDiscrepancy[]>;
}
