import type { CompanyPlan, Plan } from "@/features/plans/domain/plan";
import { ApiError, parseMessage } from "@/shared/lib/api-error";

/** Lists the plans on sale via our own route handler. */
export async function fetchPlans(): Promise<Plan[]> {
  const res = await fetch("/api/plans", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return ((await res.json()) as { plans: Plan[] }).plans;
}

/** Reads the caller's company plan and usage via our own route handler. */
export async function fetchCompanyPlan(): Promise<CompanyPlan> {
  const res = await fetch("/api/plans/company", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as CompanyPlan;
}
