import type {
  RequestAiAnalysisInput,
  RequestAiAnalysisResult,
} from "@/features/ai-analysis/domain/ai-analysis";
import type { AiAnalysisRepository } from "@/features/ai-analysis/domain/ai-analysis-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Queues an AI analysis of a cycle's evaluations (Owner/HR, Growth and
 * Enterprise plans). The backend reuses unchanged analyses and enforces the
 * monthly quota.
 */
export class RequestAiAnalysis {
  constructor(private readonly analyses: AiAnalysisRepository) {}

  async execute(
    cycleId: number,
    input: RequestAiAnalysisInput,
    accessToken: string,
  ): Promise<RequestAiAnalysisResult> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid", 400);
    }
    if (input.evaluatedUserId !== undefined && (!Number.isInteger(input.evaluatedUserId) || input.evaluatedUserId <= 0)) {
      throw new DomainError("The given employee is not valid", 400);
    }
    if (input.templateId !== undefined && (!Number.isInteger(input.templateId) || input.templateId <= 0)) {
      throw new DomainError("The given template is not valid", 400);
    }

    return this.analyses.request(cycleId, input, accessToken);
  }
}
