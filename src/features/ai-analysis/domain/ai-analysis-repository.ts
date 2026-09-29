import type {
  AiAnalysis,
  RequestAiAnalysisInput,
  RequestAiAnalysisResult,
} from "@/features/ai-analysis/domain/ai-analysis";

export interface AiAnalysisRepository {
  getByCycle(cycleId: number, evaluatedUserId: number | null, accessToken: string): Promise<AiAnalysis[]>;

  request(cycleId: number, input: RequestAiAnalysisInput, accessToken: string): Promise<RequestAiAnalysisResult>;
}
