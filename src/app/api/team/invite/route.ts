import type { NextRequest } from "next/server";
import type { InviteEmployeeInput } from "@/features/team/domain/team";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/team/invite
 * Invites an employee. Reads the caller's JWT from the session cookie and
 * forwards it to the backend `Team/invite` as a bearer token (the api key is
 * added by the BackendClient). Never exposes the token to the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<InviteEmployeeInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: InviteEmployeeInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Apellidos: String(body.Apellidos ?? "").trim(),
      Email: String(body.Email ?? "").trim(),
      Rol: String(body.Rol ?? "").trim(),
    };

    const result = await useCases.inviteEmployee.execute(input, session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
