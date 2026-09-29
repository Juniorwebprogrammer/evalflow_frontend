import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type {
  AiAnalysis,
  RequestAiAnalysisInput,
  RequestAiAnalysisResult,
} from "@/features/ai-analysis/domain/ai-analysis";

export async function fetchCycleAiAnalyses(cycleId: number): Promise<AiAnalysis[]> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/ai-analysis`, { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as AiAnalysis[];
}

export async function requestAiAnalysis(
  cycleId: number,
  input: RequestAiAnalysisInput,
): Promise<RequestAiAnalysisResult> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/ai-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as RequestAiAnalysisResult;
}
