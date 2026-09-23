import { ApiError, parseMessage } from "@/shared/lib/api-error";
import type { EvaluationType } from "@/features/evaluation-cycles/domain/evaluation-cycle";

export interface EvaluationCycleResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string;
  templateIds: number[];
  tipoEvaluacion: EvaluationType;
}

/** Lists every evaluation cycle of the caller's company via our own route handler. */
export async function listEvaluationCycles(): Promise<EvaluationCycleResponse[]> {
  const res = await fetch("/api/evaluation-cycles", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationCycleResponse[];
}

export interface CreateEvaluationCycleFormInput {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  tipoEvaluacion: EvaluationType;
}

export interface UpdateEvaluationCycleFormInput extends CreateEvaluationCycleFormInput {
  activo: boolean;
}

export interface CreateEvaluationCycleResponse {
  message: string;
  evaluationCycleId: number;
}

/** Creates an evaluation cycle via our own route handler. */
export async function createEvaluationCycle(
  input: CreateEvaluationCycleFormInput,
): Promise<CreateEvaluationCycleResponse> {
  const res = await fetch("/api/evaluation-cycles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
      FechaInicio: input.fechaInicio,
      FechaFin: input.fechaFin,
      TipoEvaluacion: input.tipoEvaluacion,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CreateEvaluationCycleResponse;
}

export interface EvaluationCycleMessageResponse {
  message: string;
}

/** Updates an evaluation cycle via our own route handler. */
export async function updateEvaluationCycle(
  id: number,
  input: UpdateEvaluationCycleFormInput,
): Promise<EvaluationCycleMessageResponse> {
  const res = await fetch(`/api/evaluation-cycles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Descripcion: input.descripcion || null,
      Activo: input.activo,
      FechaInicio: input.fechaInicio,
      FechaFin: input.fechaFin,
      TipoEvaluacion: input.tipoEvaluacion,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationCycleMessageResponse;
}

/** Deletes an evaluation cycle via our own route handler. */
export async function deleteEvaluationCycle(
  id: number,
): Promise<EvaluationCycleMessageResponse> {
  const res = await fetch(`/api/evaluation-cycles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationCycleMessageResponse;
}

/** Toggles whether a template belongs to an evaluation cycle via our own route handler. */
export async function toggleTemplateInCycle(
  cycleId: number,
  templateId: number,
): Promise<EvaluationCycleMessageResponse> {
  const res = await fetch(
    `/api/evaluation-cycles/${cycleId}/templates/${templateId}/toggle`,
    { method: "PUT" },
  );
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationCycleMessageResponse;
}

/**
 * Triggers submission generation for a cycle's assigned users via our own
 * route handler.
 */
export async function generateSubmissions(
  cycleId: number,
): Promise<EvaluationCycleMessageResponse> {
  const res = await fetch(`/api/evaluation-cycles/${cycleId}/generate-submissions`, {
    method: "POST",
  });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as EvaluationCycleMessageResponse;
}
