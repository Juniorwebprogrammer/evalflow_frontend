import type { NextRequest } from "next/server";
import type { FavoriteListInput } from "@/features/favorite-lists/domain/favorite-list";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/favorite-lists/:id
 * Updates a favorite list's name/description. Reads the caller's JWT from
 * the session cookie and forwards it to the backend
 * `PUT /favorite-lists/{id}` as a bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/favorite-lists/[listId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { listId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as
      | Partial<FavoriteListInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: FavoriteListInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Descripcion: body.Descripcion ? String(body.Descripcion).trim() : null,
    };

    const result = await useCases.updateFavoriteList.execute(
      Number(listId),
      input,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/favorite-lists/:id
 * Deletes a favorite list. Reads the caller's JWT from the session cookie
 * and forwards it to the backend `DELETE /favorite-lists/{id}` as a bearer
 * token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/favorite-lists/[listId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { listId } = await ctx.params;
    const result = await useCases.deleteFavoriteList.execute(
      Number(listId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
