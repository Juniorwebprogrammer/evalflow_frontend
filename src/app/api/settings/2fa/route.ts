import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { readUserIdFromJwt } from "@/features/auth/infrastructure/jwt-claims";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/settings/2fa → backend `Settings/2fa`.
 * The backend handler trusts whatever `UserId` is in the body instead of
 * deriving it from the bearer token's claims, so we resolve it ourselves
 * from the session JWT's `sub` claim and forward it — the caller never
 * supplies it directly.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const userId = readUserIdFromJwt(session.jwt);

    const body = (await request.json().catch(() => null)) as
      | { Enable?: boolean }
      | null;
    const enable = Boolean(body?.Enable);

    const result = await useCases.toggle2FA.execute(userId, enable, session.jwt);
    return Response.json({ message: result.message });
  } catch (error) {
    return handleError(error);
  }
}
