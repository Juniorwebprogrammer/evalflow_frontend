"use client";

import { planLimit, type PlanResource } from "@/features/plans/domain/plan";
import { useCompanyPlan } from "@/features/plans/presentation/hooks/use-plans";
import { CheckCircleIcon, CrownIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";

const ROWS: Array<{ resource: PlanResource; label: string }> = [
  { resource: "employees", label: "Empleados activos" },
  { resource: "activeCycles", label: "Ciclos activos a la vez" },
  { resource: "cyclesThisYear", label: "Ciclos que empiezan este año" },
  { resource: "customTemplates", label: "Plantillas propias" },
  { resource: "departments", label: "Departamentos" },
];

/** "Plan y uso": the company plan, each limit as a meter, and included features. */
export function PlanUsagePanel() {
  const { data, isLoading, error } = useCompanyPlan();

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Plan y uso</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Límites de tu plan y cuánto estás usando de cada uno
          </p>
        </div>
        {data && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            <CrownIcon style={{ width: 14, height: 14 }} />
            Plan {data.plan.nombre}
          </span>
        )}
      </header>

      {isLoading && <div className="mt-5 h-48 animate-pulse rounded-xl bg-slate-100" />}

      {error && (
        <p className="mt-5 text-sm text-red-600">
          {error instanceof ApiError ? error.message : "No se pudo cargar el plan."}
        </p>
      )}

      {data && (
        <>
          <ul className="mt-5 space-y-4">
            {ROWS.map(({ resource, label }) => {
              const used = data.usage[resource];
              const limit = planLimit(data.plan, resource);
              const ratio = limit ? Math.min(used / limit, 1) : 0;
              const full = limit !== null && used >= limit;
              return (
                <li key={resource}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className={`font-semibold tabular-nums ${full ? "text-red-600" : "text-slate-900"}`}>
                      {limit === null ? `${used} · ilimitado` : `${used} de ${limit}`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-r bg-[#e6effb]">
                    <div
                      className="h-full rounded-r transition-[width] duration-500"
                      style={{
                        width: limit === null ? "100%" : `${ratio * 100}%`,
                        minWidth: used > 0 ? 4 : 0,
                        background: limit === null ? "#cbd5e1" : full ? "#d03b3b" : "#2a78d6",
                      }}
                    />
                  </div>
                  {full && (
                    <p className="mt-1 text-xs text-red-600">
                      Límite alcanzado: no podrás añadir más hasta mejorar el plan.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm">
            <CheckCircleIcon
              className={`h-4 w-4 ${data.plan.hasAiFeatures ? "text-emerald-500" : "text-slate-300"}`}
            />
            <span className={data.plan.hasAiFeatures ? "text-slate-700" : "text-slate-400"}>
              Funciones de IA {data.plan.hasAiFeatures ? "incluidas" : "no incluidas (disponibles en Growth y Enterprise)"}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Para cambiar de plan, contacta con el equipo de EvalFlow.
          </p>
        </>
      )}
    </section>
  );
}
