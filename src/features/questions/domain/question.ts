/**
 * Question entities — evaluation questions nested under a template.
 * Mirrors backend `Domain/Enums/QuestionType.cs` and the
 * `Features/Questions` request bodies (`POST/PUT
 * /templates/{templateId}/questions[/{questionId}]`).
 */
export enum QuestionType {
  /** 1-to-5 star rating. */
  Estrellas = 2,
  /** Multiple choice (radio buttons or checkboxes). */
  Seleccion = 3,
  /** Numeric values from 1 to 5. */
  Escala1a5 = 4,
}

export interface QuestionInput {
  Texto: string;
  Tipo: QuestionType;
  Topic: string;
  Opciones?: string[] | null;
  Orden: number;
}

/** Mirrors the backend generic `{ Message }` response returned by update/delete. */
export interface QuestionActionResult {
  message: string;
}

/** Mirrors the backend `POST .../questions` success response. */
export interface CreateQuestionResult {
  message: string;
  questionId: number;
}

/**
 * Mirrors the backend question DTO, returned by
 * `GET /templates/{templateId}/questions`. The exact shape wasn't published
 * by the backend snippet — the HTTP repository maps it defensively.
 */
export interface Question {
  id: number;
  templateId: number;
  texto: string;
  tipo: QuestionType;
  topic: string;
  opciones: string[] | null;
  orden: number;
}
