"use client";

import { useMemo } from "react";
import { useEvaluationCycles } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { evaluationCycleStatus } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-status";
import { useEmployees } from "@/features/team/presentation/hooks/use-employees";
import { useCycleSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { useDashboardStats } from "@/features/dashboard/presentation/hooks/use-dashboard-stats";
import { ChartCard } from "@/features/dashboard/presentation/components/chart-card";
import { DonutChart, type DonutSegment } from "@/features/dashboard/presentation/components/charts/donut-chart";
import { BarList, type BarListItem } from "@/features/dashboard/presentation/components/charts/bar-list";
import { CATEGORICAL, NEUTRAL } from "@/features/dashboard/presentation/components/charts/chart-palette";
import { ApiError } from "@/shared/lib/api-error";

/** Bars shown before the tail folds into "Otros". */
const MAX_BARS = 6;

function errorMessage(error: unknown, fallback: string): string | null {
  if (!error) return null;
  return error instanceof ApiError ? error.message : fallback;
}

/** Cycles split by derived status (activo / próximo / completado / inactivo). */
export function CycleStatusCard() {
  const { data: cycles, isLoading, error } = useEvaluationCycles();

  const segments = useMemo<DonutSegment[]>(() => {
    const counts = { activo: 0, proximo: 0, completado: 0, inactivo: 0 };
    for (const cycle of cycles ?? []) counts[evaluationCycleStatus(cycle)]++;
    return [
      { key: "activo", label: "Activos", value: counts.activo, color: CATEGORICAL[0] },
      { key: "proximo", label: "Próximos", value: counts.proximo, color: CATEGORICAL[1] },
      { key: "completado", label: "Completados", value: counts.completado, color: CATEGORICAL[2] },
      { key: "inactivo", label: "Inactivos", value: counts.inactivo, color: CATEGORICAL[3] },
    ];
  }, [cycles]);

  return (
    <ChartCard
      title="Ciclos de evaluación"
      subtitle="Por estado"
      loading={isLoading}
      error={errorMessage(error, "No se pudieron cargar los ciclos.")}
      empty={cycles?.length === 0 ? "Todavía no hay ciclos de evaluación." : null}
    >
      <DonutChart segments={segments} totalLabel="ciclos" />
    </ChartCard>
  );
}

/** Role display order — each role keeps its slot (color follows the role). */
const ROLES = [
  { key: "employee", label: "Empleados" },
  { key: "superior", label: "Superiores" },
  { key: "rrhh", label: "RRHH" },
  { key: "owner", label: "Owner" },
] as const;

/** Active team members split by role. */
export function TeamByRoleCard() {
  const { data: employees, isLoading, error } = useEmployees();

  const { segments, inactive } = useMemo(() => {
    const active = (employees ?? []).filter((e) => e.activo);
    const counts = new Map<string, number>();
    for (const e of active) {
      const role = e.rol.trim().toLowerCase();
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
    const known = new Set<string>(ROLES.map((r) => r.key));
    const other = [...counts].filter(([role]) => !known.has(role)).reduce((s, [, n]) => s + n, 0);

    const segments: DonutSegment[] = ROLES.map((role, i) => ({
      key: role.key,
      label: role.label,
      value: counts.get(role.key) ?? 0,
      color: CATEGORICAL[i],
    }));
    if (other > 0) segments.push({ key: "other", label: "Otros", value: other, color: NEUTRAL });

    return { segments, inactive: (employees?.length ?? 0) - active.length };
  }, [employees]);

  return (
    <ChartCard
      title="Equipo por rol"
      subtitle={
        employees
          ? `Cuentas activas${inactive > 0 ? ` · ${inactive} ${inactive === 1 ? "inactiva" : "inactivas"}` : ""}`
          : undefined
      }
      loading={isLoading}
      error={errorMessage(error, "No se pudo cargar el equipo.")}
      empty={employees?.length === 0 ? "Todavía no hay empleados." : null}
    >
      <DonutChart segments={segments} totalLabel="personas" />
    </ChartCard>
  );
}

/** Active employees per department, largest first; the tail folds into "Otros". */
export function TeamByDepartmentCard({ className = "" }: { className?: string }) {
  const { data: employees, isLoading, error } = useEmployees();

  const items = useMemo<BarListItem[]>(() => {
    const counts = new Map<string, number>();
    let unassigned = 0;
    for (const e of employees ?? []) {
      if (!e.activo) continue;
      if (e.departamento) {
        counts.set(e.departamento.nombre, (counts.get(e.departamento.nombre) ?? 0) + 1);
      } else {
        unassigned++;
      }
    }

    const sorted = [...counts].sort((a, b) => b[1] - a[1]);
    const head = sorted.slice(0, MAX_BARS);
    const tail = sorted.slice(MAX_BARS).reduce((s, [, n]) => s + n, 0);

    const list: BarListItem[] = head.map(([name, value]) => ({ key: name, label: name, value }));
    if (tail > 0) list.push({ key: "__otros", label: "Otros departamentos", value: tail });
    if (unassigned > 0) list.push({ key: "__none", label: "Sin departamento", value: unassigned });
    return list;
  }, [employees]);

  return (
    <ChartCard
      title="Empleados por departamento"
      subtitle="Cuentas activas"
      loading={isLoading}
      error={errorMessage(error, "No se pudo cargar el equipo.")}
      empty={items.length === 0 ? "Todavía no hay empleados activos." : null}
      className={className}
    >
      <BarList items={items} />
    </ChartCard>
  );
}

/** Completion per template of the active cycle (a meter per template). */
export function TemplateProgressCard({ className = "" }: { className?: string }) {
  const { data: stats } = useDashboardStats();
  const cycleId = stats?.activeCycle?.id ?? 0;
  const { data: submissions, isLoading, error } = useCycleSubmissions(cycleId, {
    enabled: cycleId > 0,
  });

  const items = useMemo<BarListItem[]>(() => {
    const byTemplate = new Map<string, { done: number; total: number }>();
    for (const s of submissions ?? []) {
      const entry = byTemplate.get(s.templateTitle) ?? { done: 0, total: 0 };
      entry.total++;
      if (s.isCompleted) entry.done++;
      byTemplate.set(s.templateTitle, entry);
    }
    return [...byTemplate]
      .sort((a, b) => b[1].total - a[1].total)
      .map(([title, { done, total }]) => ({
        key: title,
        label: title,
        value: total > 0 ? Math.round((done / total) * 100) : 0,
        detail: `${done} de ${total} · ${total > 0 ? Math.round((done / total) * 100) : 0}%`,
      }));
  }, [submissions]);

  return (
    <ChartCard
      title="Progreso por plantilla"
      subtitle="Formularios completados en el ciclo activo"
      loading={cycleId > 0 && isLoading}
      error={errorMessage(error, "No se pudo cargar el progreso del ciclo.")}
      empty={
        cycleId === 0
          ? "No hay un ciclo activo."
          : items.length === 0
            ? "El ciclo activo todavía no tiene formularios generados."
            : null
      }
      className={className}
    >
      <BarList items={items} max={100} />
    </ChartCard>
  );
}
