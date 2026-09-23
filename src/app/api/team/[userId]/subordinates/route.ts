import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/team/:userId/subordinates
 * Lists the direct reports of a user. Reads the caller's JWT from the
 * session cookie and forwards it to the backend
 * `GET /team/{userId}/subordinates` as a bearer token.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/team/[userId]/subordinates">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { userId } = await ctx.params;
    const result = await useCases.getSubordinates.execute(
      Number(userId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
