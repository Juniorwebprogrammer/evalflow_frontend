import type {
  QuestionInput,
  QuestionActionResult,
} from "@/features/questions/domain/question";
import { QuestionType } from "@/features/questions/domain/question";
import type { QuestionRepository } from "@/features/questions/domain/question-repository";
import { DomainError } from "@/core/errors/errors";

/** Updates a question via the backend `PUT .../questions/{questionId}`. */
export class UpdateQuestion {
  constructor(private readonly questions: QuestionRepository) {}

  async execute(
    templateId: number,
    questionId: number,
    input: QuestionInput,
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
    if (!input.Texto.trim()) {
      throw new DomainError("El texto de la pregunta es obligatorio", 400);
    }
    if (!Object.values(QuestionType).includes(input.Tipo)) {
      throw new DomainError("El tipo de pregunta no es válido", 400);
    }
    if (
      input.Tipo === QuestionType.Seleccion &&
      (!input.Opciones || input.Opciones.filter((o) => o.trim()).length < 2)
    ) {
      throw new DomainError(
        "Las preguntas de selección requieren al menos 2 opciones",
        400,
      );
    }

    return this.questions.update(
      templateId,
      questionId,
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
