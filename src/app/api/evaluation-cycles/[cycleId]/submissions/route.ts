import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/evaluation-cycles/:cycleId/submissions
 * Lists every submission of a cycle (Owner/Rrhh only), so RRHH can see who
 * still has to answer. Reads the caller's JWT from the session cookie and
 * forwards it to the backend `GET /evaluation-cycles/{cycleId}/submissions`
 * as a bearer token.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/submissions">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const result = await useCases.getCycleSubmissions.execute(
      Number(cycleId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
