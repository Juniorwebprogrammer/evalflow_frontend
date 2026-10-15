import type { Tokens } from "@vexxen/auth";
import { ApiError, parseMessage, toApiError } from "@/shared/lib/api-error";

/** Signed in: the session cookies are set, go to the dashboard. */
export interface SignedInResponse {
  status: "signed_in";
  username: string;
  planStatus: string;
}

/** Signed in with Vexxen but no EvalFlow company yet: onboarding (the Vexxen tokens wait in httpOnly cookies). */
export interface NeedsOnboardingResponse {
  status: "needs_onboarding";
  email: string;
  firstName: string;
  lastName: string;
  hasPlan: boolean;
  catalogUrl: string;
}

export type VexxenSignInResponse = SignedInResponse | NeedsOnboardingResponse;

/**
 * Hands the tokens from the Vexxen popup to our server, which exchanges them for an EvalFlow session.
 * The tokens go straight to an httpOnly cookie: nothing is kept in the browser.
 */
export async function signInWithVexxen(tokens: Tokens): Promise<VexxenSignInResponse> {
  const res = await fetch("/api/auth/vexxen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as VexxenSignInResponse;
}

/** Onboarding: asks again (e.g. after choosing a plan in Vexxen). `SIGN_IN_AGAIN` once the 15 minutes are over. */
export async function recheckVexxen(): Promise<VexxenSignInResponse> {
  const res = await fetch("/api/auth/vexxen/recheck", { method: "POST" });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as VexxenSignInResponse;
}

export interface FeatureResponse {
  code: string;
  description: string;
}

export interface MyFeaturesResponse {
  role: string;
  features: FeatureResponse[];
  description: string;
}

/**
 * Fetches the current user's role, its granted features, and its
 * description via our own route handler. No body — the session cookie
 * carries the bearer token.
 */
export async function fetchMyFeatures(): Promise<MyFeaturesResponse> {
  const res = await fetch("/api/auth/my-features", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  return (await res.json()) as MyFeaturesResponse;
}
