import type { CompanyPlan, Plan } from "@/features/plans/domain/plan";

/** Port for subscription plans. Implemented by infrastructure. */
export interface PlanRepository {
  /** Every plan on sale (public — used before sign-up). */
  list(): Promise<Plan[]>;
  /** The caller's company plan and its usage. */
  getCompanyPlan(accessToken: string): Promise<CompanyPlan>;
}
