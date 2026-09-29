/**
 * Subscription plans and their limits. Mirrors the backend `PlanDto` /
 * `CompanyPlanDto` (`GET /plans`, `GET /Company/plan`). A `null` limit means
 * unlimited.
 */
export interface Plan {
  id: number;
  code: string;
  nombre: string;
  maxEmployees: number | null;
  maxActiveCycles: number | null;
  maxCyclesPerYear: number | null;
  maxCustomTemplates: number | null;
  maxDepartments: number | null;
  hasAiFeatures: boolean;
  /** AI analyses per calendar month. */
  maxAiAnalysesPerMonth: number | null;
}

export interface PlanUsage {
  employees: number;
  activeCycles: number;
  cyclesThisYear: number;
  customTemplates: number;
  departments: number;
  aiAnalysesThisMonth: number;
}

export interface CompanyPlan {
  plan: Plan;
  usage: PlanUsage;
}

/** A capped resource: its usage field and its limit field. */
export type PlanResource =
  | "employees"
  | "activeCycles"
  | "cyclesThisYear"
  | "customTemplates"
  | "departments"
  | "aiAnalysesThisMonth";

const LIMIT_FIELD: Record<PlanResource, keyof Plan> = {
  employees: "maxEmployees",
  activeCycles: "maxActiveCycles",
  cyclesThisYear: "maxCyclesPerYear",
  customTemplates: "maxCustomTemplates",
  departments: "maxDepartments",
  aiAnalysesThisMonth: "maxAiAnalysesPerMonth",
};

export function planLimit(plan: Plan, resource: PlanResource): number | null {
  return plan[LIMIT_FIELD[resource]] as number | null;
}

/** True when the company can't add one more of `resource`. */
export function isAtLimit(companyPlan: CompanyPlan | undefined, resource: PlanResource): boolean {
  if (!companyPlan) return false;
  const limit = planLimit(companyPlan.plan, resource);
  return limit !== null && companyPlan.usage[resource] >= limit;
}
