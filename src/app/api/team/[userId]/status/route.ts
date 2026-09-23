import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

interface Body {
  Activo?: boolean;
}

/**
 * PUT /api/team/:userId/status
 * Activates or deactivates an employee's account. Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `PUT /team/{userId}/status` as a bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/team/[userId]/status">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { userId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as Body | null;
    if (!body || typeof body.Activo !== "boolean") {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const result = await useCases.toggleUserStatus.execute(
      { UserId: Number(userId), Activo: body.Activo },
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
