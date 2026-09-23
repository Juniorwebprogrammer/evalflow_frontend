import type {
  AnswerInput,
  SubmissionActionResult,
} from "@/features/evaluation-submissions/domain/evaluation-submission";
import type { EvaluationSubmissionRepository } from "@/features/evaluation-submissions/domain/evaluation-submission-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Saves every answer of a submission in one shot via the backend
 * `PUT /evaluation-submissions/{submissionId}/answers`. Mirrors the
 * backend's own validation (non-empty list, no blank payloads) as a fast,
 * friendly failure before the round trip — the backend re-validates
 * regardless.
 */
export class SaveSubmissionAnswers {
  constructor(private readonly submissions: EvaluationSubmissionRepository) {}

  async execute(
    submissionId: number,
    answers: AnswerInput[],
    accessToken: string,
  ): Promise<SubmissionActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      throw new DomainError("El identificador no es válido", 400);
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new DomainError("Debes responder todas las preguntas.", 400);
    }
    if (answers.some((a) => !a.RawPayload || !a.RawPayload.trim())) {
      throw new DomainError("Ninguna respuesta puede quedar vacía.", 400);
    }

    return this.submissions.saveAnswers(submissionId, answers, accessToken);
  }
}
