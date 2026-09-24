/**
 * Clarification requests — when RRHH spots a discrepancy between a
 * self-evaluation and the manager's evaluation, it asks both the evaluated
 * employee and the evaluator to explain their answers. Mirrors the backend
 * `Features/Clarifications` contracts.
 */

export type ClarificationStatus = "Pendiente" | "Parcial" | "Respondida";

export type ClarificationParticipant = "Evaluado" | "Evaluador";

/** Mirrors the backend `ClarificationDto` (Owner/RRHH view, both answers). */
export interface Clarification {
  id: number;
  cycleId: number;
  templateId: number;
  templateTitle: string;
  questionId: number | null;
  questionText: string | null;
  evaluatedUserId: number;
  evaluatedUserName: string;
  managerUserId: number;
  managerName: string;
  requestedByName: string;
  mensaje: string;
  evaluatedResponse: string | null;
  evaluatedRespondedAt: string | null;
  managerResponse: string | null;
  managerRespondedAt: string | null;
  estado: ClarificationStatus;
  fechaCreacion: string;
}

/** Mirrors the backend `MyClarificationDto` (participant view, only their own answer). */
export interface MyClarification {
  id: number;
  cycleName: string;
  templateTitle: string;
  questionText: string | null;
  evaluatedUserName: string;
  myRole: ClarificationParticipant;
  requestedByName: string;
  mensaje: string;
  myResponse: string | null;
  myRespondedAt: string | null;
  fechaCreacion: string;
}

export interface CreateClarificationInput {
  evaluatedUserId: number;
  templateId: number;
  questionId: number | null;
  mensaje: string;
}

export const CLARIFICATION_MESSAGE_MAX_LENGTH = 1000;
export const CLARIFICATION_RESPONSE_MAX_LENGTH = 2000;
