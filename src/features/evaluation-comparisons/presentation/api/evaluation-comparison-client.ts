import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type {
  AcceptDiscrepanciesInput,
  AcceptedAnswerSource,
  AcceptedDiscrepancy,
  AlignmentLevel,
  CycleComparisons,
  EmployeeComparison,
  GapDirection,
  QuestionComparison,
  TopicComparison,
} from "@/features/evaluation-comparisons/domain/evaluation-comparison";

export type {
  AcceptDiscrepanciesInput,
  AcceptedAnswerSource,
  AcceptedDiscrepancy,
  AlignmentLevel,
  GapDirection,
  CycleComparisons as CycleComparisonsResponse,
  EmployeeComparison as EmployeeComparisonResponse,
  QuestionComparison as QuestionComparisonResponse,
  TopicComparison as TopicComparisonResponse,
};

export async function fetchCycleComparisons(
  cycleId: number,
  evaluatedUserId?: number,
): Promise<CycleComparisons> {
  const query = evaluatedUserId ? `?evaluatedUserId=${evaluatedUserId}` : "";
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/comparisons${query}`, {
    method: "GET",
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CycleComparisons;
}

export async function acceptDiscrepancies(
  cycleId: number,
  input: AcceptDiscrepanciesInput,
): Promise<AcceptedDiscrepancy[]> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/discrepancies/acceptances`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as AcceptedDiscrepancy[];
}
