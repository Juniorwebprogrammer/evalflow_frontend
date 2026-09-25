"use client";

import Link from "next/link";
import { BarsIcon, EyeIcon } from "@/shared/ui/icons";
import { useDashboardStats } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";
import { formatDate } from "@/shared/lib/format-date";

export function ActiveCycleCard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100 lg:col-span-2" />;
  }

  const cycle = stats?.activeCycle;

  if (!cycle) {
    return (
      <section className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm lg:col-span-2">
        <h2 className="text-lg font-bold text-slate-900">No hay un ciclo activo</h2>
        <p className="text-sm text-slate-500">
          Crea o activa un ciclo de evaluación para ver su progreso aquí.
        </p>
        <Link
          href="/dashboard/ciclos-evaluacion"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-strong)]"
        >
          Ver ciclos de evaluación
        </Link>
      </section>
    );
  }

  const progress =
    cycle.totalSubmissions > 0
      ? Math.round((cycle.completedCount / cycle.totalSubmissions) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{cycle.nombre}</h2>
          <p className="mt-0.5 text-sm text-slate-500">Cierre: {formatDate(cycle.fechaFin)}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
          Activo
        </span>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Progreso global</span>
          <span className="font-bold text-slate-900">{progress}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, var(--brand) 0%, var(--brand-soft) 100%)",
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 text-center">
        <Metric value={String(cycle.totalSubmissions)} label="Formularios" />
        <Metric value={String(cycle.completedCount)} label="Completados" />
        <Metric value={String(cycle.pendingCount)} label="Pendientes" />
      </div>

      <div className="mt-6 flex gap-3">
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
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
