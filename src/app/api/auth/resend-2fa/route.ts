import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/auth/resend-2fa → backend `Auth/resend-2fa`.
 * Public — no session cookie involved. Always answers a generic message
 * regardless of whether the email matched or had 2FA enabled.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { Email?: string }
      | null;

    const email = String(body?.Email ?? "").trim();
    if (!email) {
      throw new DomainError("El correo electrónico es obligatorio", 400);
    }

    const result = await useCases.resend2FA.execute(email);
    return Response.json({ message: result.message });
  } catch (error) {
    return handleError(error);
  }
}
