import type { EvaluationResultFile } from "@/features/evaluation-results/domain/evaluation-result";
import type { EvaluationResultRepository } from "@/features/evaluation-results/domain/evaluation-result-repository";
import { DomainError } from "@/core/errors/errors";

/** Downloads the PDF report of a result (the evaluated employee, or Owner/RRHH of the same company). */
export class DownloadEvaluationResultPdf {
  constructor(private readonly results: EvaluationResultRepository) {}

  async execute(resultId: number, accessToken: string): Promise<EvaluationResultFile> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(resultId) || resultId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.results.downloadPdf(resultId, accessToken);
  }
}
