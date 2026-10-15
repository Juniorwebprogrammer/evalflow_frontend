import type { NextRequest } from "next/server";
import type { RegisterOwnerInput } from "@/features/onboarding/domain/registration";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";
import {
  clearPendingVexxen,
  persistSession,
  readPendingVexxen,
} from "@/features/auth/infrastructure/session-cookies";

/**
 * POST /api/onboarding/register-owner
 * Creates the company for the person signed in with Vexxen (their tokens are in the pending cookies set by
 * /api/auth/vexxen). The backend takes the plan from Vexxen: 409 NO_PLAN if they don't have one yet. On
 * success the owner is signed in straight away (Vexxen already verified the email).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as Partial<RegisterOwnerInput> | null;
    if (!body) {
      throw new DomainError("The request is not valid.", 400);
    }

    const pending = await readPendingVexxen();
    if (!pending) {
      throw new DomainError("Your Vexxen sign-in has expired. Please sign in again.", 401, "SIGN_IN_AGAIN");
    }

    const input: RegisterOwnerInput = {
      CompanyNombre: String(body.CompanyNombre ?? "").trim(),
      CompanyColors: String(body.CompanyColors ?? "").trim(),
      Sector: String(body.Sector ?? "").trim(),
      DireccionFiscal: String(body.DireccionFiscal ?? "").trim(),
      Cif: String(body.Cif ?? "").trim(),
    };

    const result = await useCases.registerOwner.execute(input, pending.accessToken);
    await persistSession({ jwt: result.jwt, refreshToken: pending.refreshToken });
    await clearPendingVexxen();

    return Response.json({
      message: result.message,
      userNombre: result.userNombre,
      planStatus: result.planStatus,
    });
  } catch (error) {
    return handleError(error);
  }
}
