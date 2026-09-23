import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { persistSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/auth/verify-2fa → backend `Auth/verify-2fa`.
 * Public — no session cookie involved yet. Exchanges the emailed code for
 * tokens, which are then persisted as httpOnly cookies just like a normal
 * login.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { Email?: string; Code?: string }
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const email = String(body.Email ?? "").trim();
    const code = String(body.Code ?? "").trim();

    const result = await useCases.verify2FA.execute(email, code);

    await persistSession({
      jwt: result.jwt,
      refreshToken: result.refreshToken,
    });

    return Response.json({
      message: result.message,
      username: result.username,
    });
  } catch (error) {
    return handleError(error);
  }
}
