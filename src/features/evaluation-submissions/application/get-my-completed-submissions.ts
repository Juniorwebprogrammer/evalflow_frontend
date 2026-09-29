import type { PendingSubmission } from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists the caller's completed submissions via the backend `GET /evaluation-submissions/completed`. */
export class GetMyCompletedSubmissions {
  constructor(private readonly submissions: EvaluationSubmissionRepository) {}

  async execute(accessToken: string): Promise<PendingSubmission[]> {
    if (!accessToken) {
      throw new DomainError("Your session is no longer valid. Please sign in again.", 401);
    }

    return this.submissions.getCompleted(accessToken);
  }
}
