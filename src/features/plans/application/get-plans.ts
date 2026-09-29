import type { PlanRepository } from "@/features/plans/domain/plan-repository";
import type { CompanyPlan, Plan } from "@/features/plans/domain/plan";
import { DomainError } from "@/core/errors/errors";

/** Lists the plans on sale (backend `GET /plans`). */
export class GetPlans {
  constructor(private readonly plans: PlanRepository) {}

  execute(): Promise<Plan[]> {
    return this.plans.list();
  }
}

/** Reads the caller's company plan and usage (backend `GET /Company/plan`, Owner/HR). */
export class GetCompanyPlan {
  constructor(private readonly plans: PlanRepository) {}

  async execute(accessToken: string): Promise<CompanyPlan> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    return this.plans.getCompanyPlan(accessToken);
  }
}
