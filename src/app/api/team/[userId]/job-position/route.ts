import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

interface Body {
  JobPositionId?: number | null;
}

/**
 * PUT /api/team/:userId/job-position
 * Assigns (or unassigns, with `JobPositionId: null`) an employee's job
 * position (cargo). Reads the caller's JWT from the session cookie and
 * forwards it to the backend `PUT /team/{userId}/job-position` as a bearer
 * token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/team/[userId]/job-position">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { userId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const result = await useCases.assignJobPosition.execute(
      {
        UserId: Number(userId),
        JobPositionId:
          body.JobPositionId === null || body.JobPositionId === undefined
            ? null
            : Number(body.JobPositionId),
      },
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
