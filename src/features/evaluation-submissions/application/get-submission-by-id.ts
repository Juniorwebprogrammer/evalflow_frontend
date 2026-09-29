import type { SubmissionDetail } from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Fetches a submission's shell via the backend
 * `GET /evaluation-submissions/{submissionId}`. Returns `null` when it does
 * not exist or the caller isn't its respondent.
 */
export class GetSubmissionById {
  constructor(private readonly submissions: EvaluationSubmissionRepository) {}

  async execute(
    submissionId: number,
    accessToken: string,
  ): Promise<SubmissionDetail | null> {
    if (!accessToken) {
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      throw new DomainError("The ID is not valid.", 400);
    }

    return this.submissions.getById(submissionId, accessToken);
  }
}
