import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** POST /api/evaluation-cycles/:cycleId/complete — completes the cycle and generates every result. */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/complete">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const result = await useCases.completeEvaluationCycle.execute(Number(cycleId), session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
