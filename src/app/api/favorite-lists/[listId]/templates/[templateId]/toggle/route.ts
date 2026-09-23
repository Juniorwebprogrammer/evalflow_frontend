import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/favorite-lists/:listId/templates/:templateId/toggle
 * Toggles whether a template belongs to a favorite list. Reads the caller's
 * JWT from the session cookie and forwards it to the backend
 * `PUT /favorite-lists/{listId}/templates/{templateId}/toggle` as a bearer
 * token.
 */
export async function PUT(
  _request: NextRequest,
  ctx: RouteContext<"/api/favorite-lists/[listId]/templates/[templateId]/toggle">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { listId, templateId } = await ctx.params;
    const result = await useCases.toggleTemplateInList.execute(
      Number(listId),
      Number(templateId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
