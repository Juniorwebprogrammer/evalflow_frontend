import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";
import { readPendingVexxen } from "@/features/auth/infrastructure/session-cookies";
import { applySignIn } from "../session";

/**
 * POST /api/auth/vexxen/recheck
 * Onboarding: asks again with the pending Vexxen tokens, e.g. after choosing a plan in the Vexxen catalog
 * ("hasPlan" turns true) or after being invited meanwhile ("signed_in"). 401 once the 15 minutes are over.
 */
export async function POST() {
  try {
    const pending = await readPendingVexxen();
    if (!pending) throw new DomainError("Your Vexxen sign-in has expired. Please sign in again.", 401, "SIGN_IN_AGAIN");

    const result = await useCases.signInWithVexxen.execute(pending.accessToken);
    return Response.json(await applySignIn(result, pending));
  } catch (error) {
    return handleError(error);
  }
}
