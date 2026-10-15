import "server-only";
import type { VexxenSignInResult } from "@/features/auth/domain/auth";
import {
  clearPendingVexxen,
  persistPendingVexxen,
  persistSession,
} from "@/features/auth/infrastructure/session-cookies";

/**
 * Turns the backend's answer into cookies + what the browser may see. Members get the session cookies
 * (EvalFlow JWT + Vexxen refresh token). People without a company keep the Vexxen tokens as pending cookies
 * for onboarding. Tokens never reach the browser's JavaScript.
 */
export async function applySignIn(
  result: VexxenSignInResult,
  vexxen: { accessToken: string; refreshToken: string },
) {
  if (result.status === "signed_in") {
    await persistSession({ jwt: result.jwt, refreshToken: vexxen.refreshToken });
    await clearPendingVexxen();
    return { status: result.status, username: result.username, planStatus: result.planStatus };
  }

  await persistPendingVexxen(vexxen);
  return {
    status: result.status,
    email: result.email,
    firstName: result.firstName,
    lastName: result.lastName,
    hasPlan: result.hasPlan,
    catalogUrl: result.catalogUrl,
  };
}
