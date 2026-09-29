import type { Question } from "@/features/questions/domain/question";
import type { QuestionRepository } from "@/features/questions/domain/question-repository";
import { DomainError } from "@/core/errors/errors";

/** Lists every question of a template via the backend `GET .../questions`. */
export class GetQuestionsByTemplate {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(templateId: number, accessToken: string): Promise<Question[]> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new DomainError("The template ID is invalid", 400);
    }

    return this.questions.listByTemplate(templateId, accessToken);
  }
}
