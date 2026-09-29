import type { AiAnalysis } from "@/features/ai-analysis/domain/ai-analysis";
import type { AiAnalysisRepository } from "@/features/ai-analysis/domain/ai-analysis-repository";
import { DomainError } from "@/core/errors/errors";

/** The latest AI analysis of each employee of a cycle (Owner/HR). */
export class GetCycleAiAnalyses {
  constructor(private readonly analyses: AiAnalysisRepository) {}

  async execute(cycleId: number, evaluatedUserId: number | null, accessToken: string): Promise<AiAnalysis[]> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid", 400);
    }
    if (evaluatedUserId !== null && (!Number.isInteger(evaluatedUserId) || evaluatedUserId <= 0)) {
      throw new DomainError("The given employee is not valid", 400);
    }

    return this.analyses.getByCycle(cycleId, evaluatedUserId, accessToken);
  }
}
