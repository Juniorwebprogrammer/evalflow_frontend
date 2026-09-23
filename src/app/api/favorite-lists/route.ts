import type { NextRequest } from "next/server";
import type { FavoriteListInput } from "@/features/favorite-lists/domain/favorite-list";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/favorite-lists
 * Lists the caller's own favorite lists. Reads the caller's JWT from the
 * session cookie and forwards it to the backend `GET /favorite-lists` as a
 * bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.getMyFavoriteLists.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/favorite-lists
 * Creates a favorite list owned by the caller. Reads the caller's JWT from
 * the session cookie and forwards it to the backend `POST /favorite-lists`
 * as a bearer token (the api key is added by the BackendClient).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

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

    const result = await useCases.createFavoriteList.execute(input, session.jwt);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
