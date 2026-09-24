import type { EvaluationCycleResponse } from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { isPast } from "@/shared/lib/date";

export type EvaluationCycleStatus = "activo" | "proximo" | "completado" | "inactivo";

const LABEL: Record<EvaluationCycleStatus, string> = {
  activo: "Activo",
  proximo: "Próximo",
  completado: "Completado",
  inactivo: "Inactivo",
};

const BADGE_CLASS: Record<EvaluationCycleStatus, string> = {
  activo: "bg-emerald-50 text-emerald-600",
  proximo: "bg-amber-50 text-amber-600",
  completado: "bg-slate-100 text-slate-500",
  inactivo: "bg-slate-100 text-slate-500",
};

/**
 * Derives a display status from the two real signals the backend gives us
 * (`activo` + the date range) — the mockup's Activo/Completado/Borrador
 * badges, without fabricating data (progress %, participant counts) the
 * backend doesn't provide.
 */
export function evaluationCycleStatus(
  cycle: Pick<EvaluationCycleResponse, "activo" | "fechaInicio" | "fechaFin" | "fechaCompletado">,
): EvaluationCycleStatus {
  if (cycle.fechaCompletado) return "completado";

  const now = new Date();
  const start = new Date(cycle.fechaInicio);

  if (!cycle.activo) {
    return isPast(cycle.fechaFin) ? "completado" : "inactivo";
  }
  if (!Number.isNaN(start.getTime()) && now < start) return "proximo";
  return "activo";
}

export function evaluationCycleStatusLabel(status: EvaluationCycleStatus): string {
  return LABEL[status];
}

export function evaluationCycleStatusClass(status: EvaluationCycleStatus): string {
  return BADGE_CLASS[status];
}
