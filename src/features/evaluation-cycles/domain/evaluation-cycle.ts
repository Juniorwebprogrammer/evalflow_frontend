/**
 * Evaluation cycle entities — time-boxed evaluation periods that group
 * templates. Request bodies map 1:1 to the backend
 * `Features/EvaluationCycles` contracts (`POST /evaluation-cycles`,
 * `PUT /evaluation-cycles/{id}`).
 */

/**
 * Mirrors the backend `Domain/Enums/EvaluationType.cs` — which submissions
 * `POST /evaluation-cycles/{cycleId}/generate-submissions` creates for each
 * user assigned to the cycle's templates.
 */
export enum EvaluationType {
  /** Self-assessment only. */
  Auto = 0,
  /** Only the evaluator (manager) assesses the direct report. */
  Evaluacion180 = 1,
  /** Self-assessment + the evaluator assesses the direct report. */
  Evaluacion360 = 2,
}

export interface CreateEvaluationCycleInput {
  Nombre: string;
  Descripcion?: string | null;
  FechaInicio: string;
  FechaFin: string;
  TipoEvaluacion: EvaluationType;
}

export interface UpdateEvaluationCycleInput extends CreateEvaluationCycleInput {
  Activo: boolean;
}

/** Mirrors the backend `POST /evaluation-cycles` success response. */
export interface CreateEvaluationCycleResult {
  message: string;
  evaluationCycleId: number;
}

/** Mirrors the backend generic `{ Message }` response returned by update/delete/toggle. */
export interface EvaluationCycleActionResult {
  message: string;
}

/**
 * Mirrors the backend evaluation-cycle DTO, returned by
 * `GET /evaluation-cycles`. The exact shape wasn't published by the backend
 * snippet — the HTTP repository maps it defensively. `templateIds` is what
 * lets the UI show which templates already belong to a cycle without a
 * separate "cycle details" endpoint; it defaults to `[]` if absent.
 */
export interface EvaluationCycle {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string;
  templateIds: number[];
  tipoEvaluacion: EvaluationType;
  fechaCompletado: string | null;
}
