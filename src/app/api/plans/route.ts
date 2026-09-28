import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";

/** GET /api/plans — the plans on sale (public; the sign-up form lists them). */
export async function GET() {
  try {
    const plans = await useCases.getPlans.execute();
    return Response.json({ plans });
  } catch (error) {
    return handleError(error);
  }
}
