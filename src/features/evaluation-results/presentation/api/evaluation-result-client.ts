import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type {
  CompleteEvaluationCycleResult,
  EvaluationResultSummary,
} from "@/features/evaluation-results/domain/evaluation-result";

export type {
  CompleteEvaluationCycleResult as CompleteEvaluationCycleResponse,
  EvaluationResultSummary as EvaluationResultSummaryResponse,
};

export async function completeEvaluationCycle(cycleId: number): Promise<CompleteEvaluationCycleResult> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/complete`, { method: "POST" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CompleteEvaluationCycleResult;
}

export async function fetchMyEvaluationResults(): Promise<EvaluationResultSummary[]> {
  const res = await fetch("/api/evaluation-results/mine", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationResultSummary[];
}

export async function fetchCycleEvaluationResults(cycleId: number): Promise<EvaluationResultSummary[]> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/results`, { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationResultSummary[];
}

export function evaluationResultPdfUrl(resultId: number): string {
  return `/api/evaluation-results/${resultId}/pdf`;
}
