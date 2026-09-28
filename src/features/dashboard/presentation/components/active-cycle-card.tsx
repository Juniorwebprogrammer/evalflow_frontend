"use client";

import Link from "next/link";
import { BarsIcon, EyeIcon } from "@/shared/ui/icons";
import { useDashboardStats } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";
import { formatDate } from "@/shared/lib/format-date";
import { ApiError } from "@/shared/lib/api-error";
import { ChartCard } from "@/features/dashboard/presentation/components/chart-card";
import { ProgressRing } from "@/features/dashboard/presentation/components/charts/progress-ring";
import { SEQUENTIAL, NEUTRAL } from "@/features/dashboard/presentation/components/charts/chart-palette";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days elapsed vs. the cycle's total length, clamped to the range. */
function cycleTimeline(fechaInicio: string, fechaFin: string) {
  const start = new Date(fechaInicio).getTime();
  const end = new Date(fechaFin).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const totalDays = Math.max(Math.round((end - start) / DAY_MS), 1);
  const elapsed = Math.min(Math.max(Math.round((Date.now() - start) / DAY_MS), 0), totalDays);
  return { totalDays, elapsed, remaining: totalDays - elapsed };
}

/**
 * Active-cycle progress: a ring for completed forms, the completed/pending
 * split beside it, and a meter for how much of the cycle's time has gone.
 * `canManage` adds the links to the (Owner/Rrhh-only) cycle screens.
 */
export function ActiveCycleCard({ canManage, className = "" }: { canManage: boolean; className?: string }) {
  const { data: stats, isLoading, error } = useDashboardStats();
  const cycle = stats?.activeCycle ?? null;
  const timeline = cycle ? cycleTimeline(cycle.fechaInicio, cycle.fechaFin) : null;

  return (
    <ChartCard
      title={cycle ? cycle.nombre : "Ciclo activo"}
      subtitle={
        cycle ? `${formatDate(cycle.fechaInicio)} – ${formatDate(cycle.fechaFin)}` : undefined
      }
      action={
        cycle && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            Activo
          </span>
        )
      }
      loading={isLoading}
      error={
        error
          ? error instanceof ApiError
            ? error.message
            : "No se pudieron cargar las estadísticas."
          : null
      }
      empty={
        !cycle
          ? canManage
            ? "No hay un ciclo activo. Crea o activa uno para ver su progreso aquí."
            : "No hay un ciclo de evaluación activo ahora mismo."
          : null
      }
      className={className}
    >
      {cycle && (
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ProgressRing
              value={cycle.completedCount}
              total={cycle.totalSubmissions}
              caption="completado"
            />

            <div className="w-full min-w-0 flex-1 space-y-4">
              <dl className="grid grid-cols-3 gap-3 text-center sm:text-left">
                <Figure swatch={SEQUENTIAL.base} label="Completados" value={cycle.completedCount} />
                <Figure swatch={SEQUENTIAL.track} label="Pendientes" value={cycle.pendingCount} />
                <Figure label="Formularios" value={cycle.totalSubmissions} />
              </dl>

              {timeline && (
                <div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-500">Tiempo transcurrido</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {timeline.elapsed} de {timeline.totalDays} días
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-2.5 w-full overflow-hidden rounded-r"
                    style={{ background: "#f1f5f9" }}
                  >
                    <div
                      className="h-full rounded-r"
                      style={{
                        width: `${(timeline.elapsed / timeline.totalDays) * 100}%`,
                        background: NEUTRAL,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {timeline.remaining === 0
                      ? "El plazo termina hoy"
                      : `Quedan ${timeline.remaining} ${timeline.remaining === 1 ? "día" : "días"} para el cierre`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {canManage && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <Link
                href={`/dashboard/ciclos-evaluacion/${cycle.id}/comparacion`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
              >
                <BarsIcon style={{ width: 16, height: 16 }} />
                Ver resultados
              </Link>
              <Link
                href={`/dashboard/ciclos-evaluacion/${cycle.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <EyeIcon style={{ width: 16, height: 16 }} />
                Gestionar ciclo
              </Link>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}

function Figure({ label, value, swatch }: { label: string; value: number; swatch?: string }) {
  return (
    <div>
      <dt className="flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:justify-start">
        {swatch && <span className="h-2.5 w-2.5 rounded-sm" style={{ background: swatch }} />}
        {label}
      </dt>
      <dd className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
