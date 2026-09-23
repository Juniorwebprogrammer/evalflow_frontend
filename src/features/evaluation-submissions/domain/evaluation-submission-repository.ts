import type {
  PendingSubmission,
  SubmissionDetail,
  AnswerInput,
  SubmissionActionResult,
  CycleSubmission,
} from "@/features/evaluation-submissions/domain/evaluation-submission";

/** Port for evaluation-submission management. Implemented by the infrastructure layer. */
export interface EvaluationSubmissionRepository {
  /** Lists the caller's not-yet-completed submissions for active cycles. */
  getPending(accessToken: string): Promise<PendingSubmission[]>;

  /** Lists the caller's already-completed submissions. */
  getCompleted(accessToken: string): Promise<PendingSubmission[]>;

  /**
   * Fetches a submission's "shell" (template title/description + ordered
   * questions) so the frontend can render the form. Returns `null` when it
   * does not exist or the caller isn't its respondent (backend 404).
   */
  getById(submissionId: number, accessToken: string): Promise<SubmissionDetail | null>;

  /**
   * Saves every answer in one shot and marks the submission completed.
   * The backend requires all questions to be answered at once — there is no
   * partial save.
   */
  saveAnswers(
    submissionId: number,
    answers: AnswerInput[],
    accessToken: string,
  ): Promise<SubmissionActionResult>;

  /** Lists every submission of a cycle, for Owner/Rrhh to see completion progress. */
  getByCycle(cycleId: number, accessToken: string): Promise<CycleSubmission[]>;

  /** Deletes a submission (Owner/Rrhh only), e.g. to fix a mistake. */
  remove(submissionId: number, accessToken: string): Promise<SubmissionActionResult>;
}
