import type {
  RequestAiAnalysisInput,
  RequestAiAnalysisResult,
} from "@/features/ai-analysis/domain/ai-analysis";
import type { AiAnalysisRepository } from "@/features/ai-analysis/domain/ai-analysis-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Queues an AI analysis of a cycle's evaluations (Owner/RRHH, Growth and
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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }
    if (input.evaluatedUserId !== undefined && (!Number.isInteger(input.evaluatedUserId) || input.evaluatedUserId <= 0)) {
      throw new DomainError("El empleado indicado no es válido", 400);
    }
    if (input.templateId !== undefined && (!Number.isInteger(input.templateId) || input.templateId <= 0)) {
      throw new DomainError("La plantilla indicada no es válida", 400);
    }

    return this.analyses.request(cycleId, input, accessToken);
  }
}
