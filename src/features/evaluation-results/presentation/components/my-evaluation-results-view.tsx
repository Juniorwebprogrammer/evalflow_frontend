"use client";

import { useMyEvaluationResults } from "@/features/evaluation-results/presentation/hooks/use-evaluation-results";
import { DownloadReportLink } from "@/features/evaluation-results/presentation/components/download-report-link";
import { formatScore } from "@/features/evaluation-comparisons/presentation/components/alignment-level";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, BarsIcon, CalendarIcon, TrendUpIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

/** "Resultados de evaluación" — the caller's completed evaluations, each with its PDF report. */
export function MyEvaluationResultsView() {
  const { data, isLoading, error } = useMyEvaluationResults();

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-sm text-slate-500">Cargando resultados…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error instanceof ApiError ? error.message : "No se pudieron cargar tus resultados."}
        </Notice>
      )}

      {data && data.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <BarsIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>Todavía no tienes resultados. Aparecerán aquí cuando RRHH complete un ciclo de evaluación.</span>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((result) => (
            <section
              key={result.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
                  <TrendUpIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{result.templateTitle}</h3>
                  <p className="text-sm text-slate-500">{result.cycleName}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Completada el {formatDate(result.completedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Puntuación</p>
                  <p className="text-lg font-bold text-slate-800">{formatScore(result.averageFinal)}</p>
                </div>
                <DownloadReportLink resultId={result.id} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
