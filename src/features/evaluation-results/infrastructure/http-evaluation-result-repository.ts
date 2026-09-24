import "server-only";
import type {
  CompleteEvaluationCycleResult,
  EvaluationResultFile,
  EvaluationResultSummary,
} from "@/features/evaluation-results/domain/evaluation-result";
import type { EvaluationResultRepository } from "@/features/evaluation-results/domain/evaluation-result-repository";
import { BackendClient } from "@/core/http/backend-client";

interface EvaluationResultSummaryDto {
  id?: number;
  cycleId?: number;
  cycleName?: string;
  templateId?: number;
  templateTitle?: string;
  evaluatedUserId?: number;
  evaluatedUserName?: string;
  completedAt?: string;
  averageFinal?: number | null;
}

interface CompleteEvaluationCycleDto {
  message?: string;
  resultsGenerated?: number;
  autoCompletedSubmissions?: number;
  completedAt?: string;
}

function mapSummary(dto: EvaluationResultSummaryDto): EvaluationResultSummary {
  return {
    id: dto.id ?? 0,
    cycleId: dto.cycleId ?? 0,
    cycleName: dto.cycleName ?? "",
    templateId: dto.templateId ?? 0,
    templateTitle: dto.templateTitle ?? "",
    evaluatedUserId: dto.evaluatedUserId ?? 0,
    evaluatedUserName: dto.evaluatedUserName ?? "",
    completedAt: dto.completedAt ?? "",
    averageFinal: dto.averageFinal ?? null,
  };
}

export class HttpEvaluationResultRepository implements EvaluationResultRepository {
  constructor(private readonly client: BackendClient) {}

  async completeCycle(cycleId: number, accessToken: string): Promise<CompleteEvaluationCycleResult> {
    const dto = await this.client.request<CompleteEvaluationCycleDto>(
      `/evaluation-cycles/${cycleId}/complete`,
      { method: "POST", accessToken },
    );
    return {
      message: dto?.message ?? "Evaluación completada.",
      resultsGenerated: dto?.resultsGenerated ?? 0,
      autoCompletedSubmissions: dto?.autoCompletedSubmissions ?? 0,
      completedAt: dto?.completedAt ?? "",
    };
  }

  async getMine(accessToken: string): Promise<EvaluationResultSummary[]> {
    const dto = await this.client.request<EvaluationResultSummaryDto[]>("/evaluation-results/mine", {
      accessToken,
    });
    return (dto ?? []).map(mapSummary);
  }

  async getByCycle(cycleId: number, accessToken: string): Promise<EvaluationResultSummary[]> {
    const dto = await this.client.request<EvaluationResultSummaryDto[]>(
      `/evaluation-cycles/${cycleId}/results`,
      { accessToken },
    );
    return (dto ?? []).map(mapSummary);
  }

  async downloadPdf(resultId: number, accessToken: string): Promise<EvaluationResultFile> {
    return this.client.requestFile(`/evaluation-results/${resultId}/pdf`, { accessToken });
  }
}
