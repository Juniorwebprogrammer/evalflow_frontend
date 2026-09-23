import type { NextRequest } from "next/server";
import type { LoginInput } from "@/features/auth/domain/auth";
import { useCases } from "@/core/di/container";
import { persistSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/auth/login
 * Proxies to the backend `Auth/login` endpoint (keeping the api key on the
 * server). If the account has 2FA enabled, the backend answers with a
 * challenge instead of tokens — we forward that as-is and persist nothing
 * yet; the client must complete `Auth/verify-2fa` first. Otherwise the jwt /
 * refresh token are stored as httpOnly cookies before the client redirects
 * to the dashboard.
 *
 * `IdentificationId` comes from the previously resolved company; the browser
 * only holds it in memory and forwards it here for this single request.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | Partial<LoginInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: LoginInput = {
      Email: String(body.Email ?? "").trim(),
      Password: String(body.Password ?? ""),
      IdentificationId: String(body.IdentificationId ?? "").trim(),
    };

    const result = await useCases.loginUser.execute(input);

    if (result.requires2FA) {
      return Response.json({
        requires2FA: true,
        message: result.message,
        email: result.email,
      });
    }

    await persistSession({
      jwt: result.jwt,
      refreshToken: result.refreshToken,
    });

    return Response.json({
      requires2FA: false,
      message: result.message,
      username: result.username,
    });
  } catch (error) {
    return handleError(error);
  }
}
