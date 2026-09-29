import type { CycleSubmission } from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Lists every submission of a cycle via the backend
 * `GET /evaluation-cycles/{cycleId}/submissions` (Owner/Rrhh only), so RRHH
 * can see who still has to answer.
 */
export class GetCycleSubmissions {
  constructor(private readonly submissions: EvaluationSubmissionRepository) {}

  async execute(cycleId: number, accessToken: string): Promise<CycleSubmission[]> {
    if (!accessToken) {
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (!Number.isInteger(cycleId) || cycleId <= 0) {
      throw new DomainError("The ID is not valid.", 400);
    }

    return this.submissions.getByCycle(cycleId, accessToken);
  }
}
