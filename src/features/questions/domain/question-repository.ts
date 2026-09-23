import type {
  Question,
  QuestionInput,
  CreateQuestionResult,
  QuestionActionResult,
} from "@/features/questions/domain/question";

/** Port for question management. Implemented by the infrastructure layer. */
export interface QuestionRepository {
  /** Creates a question under a template. */
  create(
    templateId: number,
    input: QuestionInput,
    accessToken: string,
  ): Promise<CreateQuestionResult>;

  /** Updates a question's fields. */
  update(
    templateId: number,
    questionId: number,
    input: QuestionInput,
    accessToken: string,
  ): Promise<QuestionActionResult>;

  /** Deletes a question. */
  remove(
    templateId: number,
    questionId: number,
    accessToken: string,
  ): Promise<QuestionActionResult>;

  /** Lists every question of a template, ordered by `Orden`. */
  listByTemplate(templateId: number, accessToken: string): Promise<Question[]>;
}
