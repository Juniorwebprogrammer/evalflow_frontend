"use client";

import { isAtLimit, planLimit, type PlanResource } from "@/features/plans/domain/plan";
import { useCompanyPlan } from "@/features/plans/presentation/hooks/use-plans";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon } from "@/shared/ui/icons";

const WHAT: Record<PlanResource, (limit: number) => string> = {
  employees: (n) => `${n} active ${n === 1 ? "employee" : "employees"}`,
  activeCycles: (n) => `${n} active ${n === 1 ? "cycle" : "cycles"} at a time`,
  cyclesThisYear: (n) => `${n} evaluation ${n === 1 ? "cycle" : "cycles"} starting this year`,
  customTemplates: (n) => `${n} custom ${n === 1 ? "template" : "templates"}`,
  departments: (n) => `${n} ${n === 1 ? "department" : "departments"}`,
  aiAnalysesThisMonth: (n) => `${n} AI ${n === 1 ? "analysis" : "analyses"} per month`,
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
      ? `Your ${data.plan.nombre} plan allows up to ${WHAT[resource](limit)}. Contact EvalFlow to upgrade your plan.`
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
