"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useEvaluationCycles } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { EvaluationCycleFormModal } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-form-modal";
import {
  evaluationCycleStatus,
  evaluationCycleStatusClass,
  evaluationCycleStatusLabel,
} from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-status";
import { evaluationTypeLabel } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-type-label";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import {
  AlertTriangleIcon,
  CalendarIcon,
  ClipboardIcon,
  DocIcon,
  PlusIcon,
  SearchIcon,
} from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";
import { isPrivilegedRole } from "@/shared/lib/roles";

/**
 * Evaluation cycle directory (backend `GET /evaluation-cycles`) — a stack of
 * cards (name, status badge, date range, template count), each linking to
 * its detail page. Editing, deleting, managing templates and the list of
 * assigned users all live there now, not on this list — search box and a
 * "Nuevo ciclo" button are all that stays here.
 */
export function EvaluationCyclesList() {
  const { data: cycles, isLoading, error } = useEvaluationCycles();
  const { data: myFeatures } = useMyFeatures();
  const canManage = isPrivilegedRole(myFeatures?.role);

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (!cycles) return [];
    const term = search.trim().toLowerCase();
    if (!term) return cycles;
    return cycles.filter((c) =>
      `${c.nombre} ${c.descripcion ?? ""}`.toLowerCase().includes(term),
    );
  }, [cycles, search]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando ciclos de evaluación…</p>;
  }

  if (error) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el listado de ciclos de evaluación."}
      </Notice>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ciclo…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
          />
        </div>
        {canManage && (
          <Button type="button" onClick={() => setCreating(true)}>
            <PlusIcon className="h-4 w-4" />
            Nuevo ciclo
          </Button>
        )}
      </div>

      {(!cycles || cycles.length === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <ClipboardIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Todavía no hay ningún ciclo de evaluación creado.</span>
        </div>
      )}

      {filtered.length === 0 && cycles && cycles.length > 0 && (
        <p className="rounded-2xl border border-slate-100 bg-white px-5 py-6 text-center text-sm text-slate-500 shadow-sm">
          Ningún ciclo coincide con la búsqueda.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((cycle) => {
          const status = evaluationCycleStatus(cycle);
          return (
            <Link
              key={cycle.id}
              href={`/dashboard/ciclos-evaluacion/${cycle.id}`}
              className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-slate-900">{cycle.nombre}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${evaluationCycleStatusClass(status)}`}
                  >
                    {evaluationCycleStatusLabel(status)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {evaluationTypeLabel(cycle.tipoEvaluacion)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    {formatDate(cycle.fechaInicio)} → {formatDate(cycle.fechaFin)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <DocIcon className="h-4 w-4 text-slate-400" />
                    {cycle.templateIds.length}{" "}
                    {cycle.templateIds.length === 1 ? "plantilla" : "plantillas"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {creating && <EvaluationCycleFormModal onClose={() => setCreating(false)} />}
    </div>
  );
}
