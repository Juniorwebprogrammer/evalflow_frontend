"use client";

import { isAtLimit, planLimit, type PlanResource } from "@/features/plans/domain/plan";
import { useCompanyPlan } from "@/features/plans/presentation/hooks/use-plans";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon } from "@/shared/ui/icons";

const WHAT: Record<PlanResource, (limit: number) => string> = {
  employees: (n) => `${n} empleados activos`,
  activeCycles: (n) => (n === 1 ? "1 ciclo activo a la vez" : `${n} ciclos activos a la vez`),
  cyclesThisYear: (n) => `${n} ciclos de evaluación que empiecen este año`,
  customTemplates: (n) => `${n} plantillas propias`,
  departments: (n) => `${n} departamentos`,
  aiAnalysesThisMonth: (n) => `${n} análisis con IA al mes`,
};

/**
 * Whether the company is at its plan's limit for `resource`, plus the
 * message to show. Never blocks while the plan is loading or for roles that
 * can't read it — the backend enforces the limit regardless.
 */
export function usePlanLimit(resource: PlanResource) {
  const { data } = useCompanyPlan();
  const atLimit = isAtLimit(data, resource);
  const limit = data ? planLimit(data.plan, resource) : null;
  const message =
    atLimit && data && limit !== null
      ? `Tu plan ${data.plan.nombre} permite hasta ${WHAT[resource](limit)}. Contacta con EvalFlow para mejorar tu plan.`
      : null;
  return { atLimit, message };
}

/** Warning banner shown when the company has used up `resource` in its plan. */
export function PlanLimitNotice({ resource, className = "" }: { resource: PlanResource; className?: string }) {
  const { message } = usePlanLimit(resource);
  if (!message) return null;
  return (
    <Notice tone="warning" icon={<AlertTriangleIcon className="h-5 w-5" />} className={className}>
      {message}
    </Notice>
  );
}
