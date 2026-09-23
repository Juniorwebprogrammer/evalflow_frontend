import type { NextRequest } from "next/server";
import type { UpdateProfileInput } from "@/features/profile/domain/profile";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET  /api/profile  → the authenticated user's profile (backend `Profile/me`).
 * PUT  /api/profile  → updates Nombre / Apellidos (backend `Profile/update`).
 *
 * Both read the caller's JWT from the session cookie and forward it as a bearer
 * token; the api key is added server-side by the BackendClient.
 */
export async function GET() {
  try {
    const session = await requireSession();
    const profile = await useCases.getMyProfile.execute(session.jwt);
    return Response.json({ profile });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();

    const body = (await request.json().catch(() => null)) as
      | Partial<UpdateProfileInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: UpdateProfileInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Apellidos: String(body.Apellidos ?? "").trim(),
    };

    await useCases.updateProfile.execute(input, session.jwt);

    return Response.json({ message: "Profile updated" });
  } catch (error) {
    return handleError(error);
  }
}

async function requireSession() {
  const session = await readSession();
  if (!session) {
    throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
  }
  return session;
}
