import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** GET /api/plans/company — the caller's company plan and usage (Owner/Rrhh). */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) throw new DomainError("Your session has expired. Please sign in again.", 401);

    const companyPlan = await useCases.getCompanyPlan.execute(session.jwt);
    return Response.json(companyPlan);
  } catch (error) {
    return handleError(error);
  }
}
