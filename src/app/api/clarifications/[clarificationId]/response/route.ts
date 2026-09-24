import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** PUT /api/clarifications/:clarificationId/response — saves the caller's explanation. */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/clarifications/[clarificationId]/response">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { clarificationId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as { respuesta?: string } | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const result = await useCases.respondClarification.execute(
      Number(clarificationId),
      String(body.respuesta ?? ""),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
