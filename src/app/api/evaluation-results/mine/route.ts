import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** GET /api/evaluation-results/mine — the caller's own evaluation results. */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.getMyEvaluationResults.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
