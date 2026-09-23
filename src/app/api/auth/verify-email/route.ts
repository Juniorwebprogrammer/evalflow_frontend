import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/auth/verify-email → backend `Auth/verify-email`.
 * Public — no session cookie involved. Validates the token carried by the
 * link sent in the verification email.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { token?: string }
      | null;

    const token = String(body?.token ?? "").trim();
    if (!token) {
      throw new DomainError("El enlace de verificación no es válido.", 400);
    }

    const result = await useCases.verifyEmail.execute(token);
    return Response.json({ message: result.message, tenantId: result.tenantId });
  } catch (error) {
    return handleError(error);
  }
}
