import type { NextRequest } from "next/server";
import type { ChangePasswordInput } from "@/features/profile/domain/profile";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/profile/change-password → backend `Profile/change-password`.
 * Reads the caller's JWT from the session cookie and forwards it as a bearer
 * token; the api key is added server-side by the BackendClient.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<ChangePasswordInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: ChangePasswordInput = {
      CurrentPassword: String(body.CurrentPassword ?? ""),
      NewPassword: String(body.NewPassword ?? ""),
    };

    await useCases.changePassword.execute(input, session.jwt);

    return Response.json({ message: "Password changed" });
  } catch (error) {
    return handleError(error);
  }
}
