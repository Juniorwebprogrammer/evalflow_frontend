import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/evaluation-cycles/:cycleId/generate-submissions
 * Materializes self/manager submissions for the cycle's assigned users and
 * emails them a heads-up. Reads the caller's JWT from the session cookie and
 * forwards it to the backend
 * `POST /evaluation-cycles/{cycleId}/generate-submissions` as a bearer
 * token.
 */
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/generate-submissions">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const result = await useCases.generateSubmissions.execute(
      Number(cycleId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
