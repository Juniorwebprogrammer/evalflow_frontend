import type { ClarificationStatus } from "@/features/clarifications/presentation/api/clarification-client";

const STATUS_LABEL: Record<ClarificationStatus, string> = {
  Pendiente: "Sin respuestas",
  Parcial: "Respondida parcialmente",
  Respondida: "Respondida",
};

const STATUS_BADGE_CLASS: Record<ClarificationStatus, string> = {
  Pendiente: "bg-amber-50 text-amber-600",
  Parcial: "bg-sky-50 text-sky-600",
  Respondida: "bg-emerald-50 text-emerald-600",
};

export function clarificationStatusLabel(status: ClarificationStatus): string {
  return STATUS_LABEL[status] ?? STATUS_LABEL.Pendiente;
}

export function clarificationStatusClass(status: ClarificationStatus): string {
  return STATUS_BADGE_CLASS[status] ?? STATUS_BADGE_CLASS.Pendiente;
}

export const TEXTAREA_CLASS =
  "w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
