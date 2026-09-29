import type {
  QuestionInput,
  CreateQuestionResult,
} from "@/features/questions/domain/question";
import { QuestionType } from "@/features/questions/domain/question";
import type { QuestionRepository } from "@/features/questions/domain/question-repository";
import { DomainError } from "@/core/errors/errors";

/** Creates a question under a template via the backend `POST .../questions`. */
export class CreateQuestion {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(
    templateId: number,
    input: QuestionInput,
    accessToken: string,
  ): Promise<CreateQuestionResult> {
    if (!accessToken) {
      throw new DomainError("Your session is invalid. Please sign in again.", 401);
    }
    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new DomainError("The template ID is invalid", 400);
    }
    if (!input.Texto.trim()) {
      throw new DomainError("The question text is required", 400);
    }
    if (!Object.values(QuestionType).includes(input.Tipo)) {
      throw new DomainError("The question type is invalid", 400);
    }
    if (
      input.Tipo === QuestionType.Seleccion &&
      (!input.Opciones || input.Opciones.filter((o) => o.trim()).length < 2)
    ) {
      throw new DomainError(
        "Choice questions need at least 2 options",
        400,
      );
    }

    return this.questions.create(
      templateId,
      {
        Texto: input.Texto.trim(),
        Tipo: input.Tipo,
        Topic: input.Topic.trim(),
        Opciones:
          input.Tipo === QuestionType.Seleccion
            ? (input.Opciones ?? []).map((o) => o.trim()).filter(Boolean)
            : null,
        Orden: input.Orden,
      },
      accessToken,
    );
  }
}
