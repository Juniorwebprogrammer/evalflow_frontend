import type { SubmissionActionResult } from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes a submission via the backend `DELETE /evaluation-submissions/{submissionId}` (Owner/Rrhh only). */
export class DeleteSubmission {
  constructor(private readonly submissions: EvaluationSubmissionRepository) {}

  async execute(submissionId: number, accessToken: string): Promise<SubmissionActionResult> {
    if (!accessToken) {
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      throw new DomainError("The ID is not valid.", 400);
    }

    return this.submissions.remove(submissionId, accessToken);
  }
}
