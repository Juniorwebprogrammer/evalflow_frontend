import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/auth/reset-password → backend `Auth/reset-password`.
 * Public — no session cookie involved. Sets a new password from the token
 * carried by the password-reset email link.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { token?: string; newPassword?: string }
      | null;

    const token = String(body?.token ?? "").trim();
    const newPassword = String(body?.newPassword ?? "");
    if (!token) {
      throw new DomainError("El enlace de recuperación no es válido.", 400);
    }

    const result = await useCases.resetPassword.execute(token, newPassword);
    return Response.json({ message: result.message });
  } catch (error) {
    return handleError(error);
  }
}
