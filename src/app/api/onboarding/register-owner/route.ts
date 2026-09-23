import type { NextRequest } from "next/server";
import type { RegisterOwnerInput } from "@/features/onboarding/domain/registration";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * POST /api/onboarding/register-owner
 * Registers the owner + company. The backend still returns a jwt / refresh
 * token in the response, but the account isn't usable until the owner
 * verifies their email (the backend rejects login otherwise), so we
 * deliberately do NOT persist a session here — the client shows a "check your
 * inbox" screen instead of logging in automatically.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | Partial<RegisterOwnerInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: RegisterOwnerInput = {
      UserNombre: String(body.UserNombre ?? "").trim(),
      Apellidos: String(body.Apellidos ?? "").trim(),
      Email: String(body.Email ?? "").trim(),
      Password: String(body.Password ?? ""),
      CompanyNombre: String(body.CompanyNombre ?? "").trim(),
      CompanyColors: String(body.CompanyColors ?? "").trim(),
      PlanId: Number(body.PlanId ?? 0),
      Sector: String(body.Sector ?? "").trim(),
      DireccionFiscal: String(body.DireccionFiscal ?? "").trim(),
      Cif: String(body.Cif ?? "").trim(),
    };

    const result = await useCases.registerOwner.execute(input);

    return Response.json({
      message: result.message,
      userNombre: result.userNombre,
    });
  } catch (error) {
    return handleError(error);
  }
}
