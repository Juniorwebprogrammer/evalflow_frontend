import type { QuestionActionResult } from "@/features/questions/domain/question";
import type { QuestionRepository } from "@/features/questions/domain/question-repository";
import { DomainError } from "@/core/errors/errors";

/** Deletes a question via the backend `DELETE .../questions/{questionId}`. */
export class DeleteQuestion {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(
    templateId: number,
    questionId: number,
    accessToken: string,
  ): Promise<QuestionActionResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (
      !Number.isInteger(templateId) ||
      templateId <= 0 ||
      !Number.isInteger(questionId) ||
      questionId <= 0
    ) {
      throw new DomainError("El identificador no es válido", 400);
    }

    return this.questions.remove(templateId, questionId, accessToken);
  }
}
