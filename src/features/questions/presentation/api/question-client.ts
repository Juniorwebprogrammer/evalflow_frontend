import { ApiError, parseMessage } from "@/shared/lib/api-error";
import { QuestionType } from "@/features/questions/domain/question";

export interface QuestionResponse {
  id: number;
  templateId: number;
  texto: string;
  topic: string;
  tipo: QuestionType;
  opciones: string[] | null;
  orden: number;
}

/** Lists every question of a template via our own route handler. */
export async function listQuestions(templateId: number): Promise<QuestionResponse[]> {
  const res = await fetch(`/api/templates/${templateId}/questions`, {
    method: "GET",
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as QuestionResponse[];
}

export interface QuestionFormInput {
  texto: string;
  tipo: QuestionType;
  topic: string;
  opciones?: string[] | null;
  orden: number;
}

export interface CreateQuestionResponse {
  message: string;
  questionId: number;
}

/** Creates a question under a template via our own route handler. */
export async function createQuestion(
  templateId: number,
  input: QuestionFormInput,
): Promise<CreateQuestionResponse> {
  const res = await fetch(`/api/templates/${templateId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Texto: input.texto,
      Tipo: input.tipo,
      Topic: input.topic,
      Opciones: input.opciones ?? null,
      Orden: input.orden,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateQuestionResponse;
}

export interface QuestionMessageResponse {
  message: string;
}

/** Updates a question via our own route handler. */
export async function updateQuestion(
  templateId: number,
  questionId: number,
  input: QuestionFormInput,
): Promise<QuestionMessageResponse> {
  const res = await fetch(`/api/templates/${templateId}/questions/${questionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Texto: input.texto,
      Tipo: input.tipo,
      Topic: input.topic,
      Opciones: input.opciones ?? null,
      Orden: input.orden,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as QuestionMessageResponse;
}

/** Deletes a question via our own route handler. */
export async function deleteQuestion(
  templateId: number,
  questionId: number,
): Promise<QuestionMessageResponse> {
  const res = await fetch(`/api/templates/${templateId}/questions/${questionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as QuestionMessageResponse;
}
