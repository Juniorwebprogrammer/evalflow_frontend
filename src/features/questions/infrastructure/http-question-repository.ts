import "server-only";
import type {
  Question,
  QuestionInput,
  CreateQuestionResult,
  QuestionActionResult,
} from "@/features/questions/domain/question";
import { QuestionType } from "@/features/questions/domain/question";
import type { QuestionRepository } from "@/features/questions/domain/question-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend question-creation response (PascalCase, tolerant to variations). */
interface CreateQuestionDto {
  Message?: string;
  message?: string;
  QuestionId?: number;
  questionId?: number;
  Id?: number;
  id?: number;
}

/** Raw backend generic `{ Message }` response (PascalCase, tolerant to variations). */
interface MessageDto {
  Message?: string;
  message?: string;
}

/**
 * Raw backend question DTO (PascalCase, tolerant to variations). The exact
 * shape wasn't published — this accepts every plausible alias.
 */
interface QuestionDto {
  Id?: number;
  id?: number;
  TemplateId?: number;
  templateId?: number;
  Texto?: string;
  texto?: string;
  Tipo?: QuestionType;
  tipo?: QuestionType;
  Topic?: string;
  topic?: string;
  Opciones?: string[] | null;
  opciones?: string[] | null;
  Orden?: number;
  orden?: number;
}

function mapQuestion(dto: QuestionDto, fallbackTemplateId: number): Question {
  return {
    id: dto.Id ?? dto.id ?? 0,
    templateId: dto.TemplateId ?? dto.templateId ?? fallbackTemplateId,
    texto: dto.Texto ?? dto.texto ?? "",
    tipo: dto.Tipo ?? dto.tipo ?? QuestionType.Escala1a5,
    topic: dto.Topic ?? dto.topic ?? "",
    opciones: dto.Opciones ?? dto.opciones ?? null,
    orden: dto.Orden ?? dto.orden ?? 0,
  };
}

export class HttpQuestionRepository implements QuestionRepository {
  constructor(private readonly client: BackendClient) {}

  async create(
    templateId: number,
    input: QuestionInput,
    accessToken: string,
  ): Promise<CreateQuestionResult> {
    const dto = await this.client.request<CreateQuestionDto>(
      `/templates/${templateId}/questions`,
      {
        method: "POST",
        accessToken,
        body: {
          Texto: input.Texto,
          Tipo: input.Tipo,
          Topic: input.Topic,
          Opciones: input.Opciones ?? null,
          Orden: input.Orden,
        },
      },
    );

    if (!dto) {
      throw new UpstreamError(
        "El servidor no devolvió una respuesta al crear la pregunta",
      );
    }

    return {
      message: dto.Message ?? dto.message ?? "Pregunta creada con éxito.",
      questionId: dto.QuestionId ?? dto.questionId ?? dto.Id ?? dto.id ?? 0,
    };
  }

  async update(
    templateId: number,
    questionId: number,
    input: QuestionInput,
    accessToken: string,
  ): Promise<QuestionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/templates/${templateId}/questions/${questionId}`,
      {
        method: "PUT",
        accessToken,
        body: {
          Texto: input.Texto,
          Tipo: input.Tipo,
          Topic: input.Topic,
          Opciones: input.Opciones ?? null,
          Orden: input.Orden,
        },
      },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Pregunta actualizada correctamente.",
    };
  }

  async remove(
    templateId: number,
    questionId: number,
    accessToken: string,
  ): Promise<QuestionActionResult> {
    const dto = await this.client.request<MessageDto>(
      `/templates/${templateId}/questions/${questionId}`,
      { method: "DELETE", accessToken },
    );

    return {
      message: dto?.Message ?? dto?.message ?? "Pregunta eliminada correctamente.",
    };
  }

  async listByTemplate(
    templateId: number,
    accessToken: string,
  ): Promise<Question[]> {
    const dto = await this.client.request<QuestionDto[]>(
      `/templates/${templateId}/questions`,
      { accessToken },
    );

    return (dto ?? [])
      .map((q) => mapQuestion(q, templateId))
      .sort((a, b) => a.orden - b.orden);
  }
}
