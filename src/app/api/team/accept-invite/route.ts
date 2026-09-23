import type { NextRequest } from "next/server";
import type { AcceptInviteInput } from "@/features/team/domain/team";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/team/accept-invite
 * Completes an employee invitation. Public — no session cookie involved, the
 * invitation token itself authorizes the request (mirrors the backend, which
 * marks `Team/accept-invite` as `AllowAnonymous`).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | Partial<AcceptInviteInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: AcceptInviteInput = {
      Token: String(body.Token ?? "").trim(),
      Nombre: String(body.Nombre ?? "").trim(),
      Apellidos: String(body.Apellidos ?? "").trim(),
      Password: String(body.Password ?? ""),
    };

    const result = await useCases.acceptInvite.execute(input);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
