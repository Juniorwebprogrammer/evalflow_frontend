import type {
  CompleteEvaluationCycleResult,
  EvaluationResultFile,
  EvaluationResultSummary,
} from "@/features/evaluation-results/domain/evaluation-result";

export interface EvaluationResultRepository {
  completeCycle(cycleId: number, accessToken: string): Promise<CompleteEvaluationCycleResult>;

  getMine(accessToken: string): Promise<EvaluationResultSummary[]>;

  getByCycle(cycleId: number, accessToken: string): Promise<EvaluationResultSummary[]>;

  downloadPdf(resultId: number, accessToken: string): Promise<EvaluationResultFile>;
}
