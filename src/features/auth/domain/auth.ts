/**
 * Auth entities. Accounts live in Vexxen: the browser signs in with the Vexxen
 * popup and our server exchanges the Vexxen access token for an EvalFlow
 * session (`Auth/vexxen`). The refresh token kept in the session is Vexxen's,
 * so the EvalFlow session ends when the Vexxen one does.
 */

/** The session persisted as httpOnly cookies: EvalFlow JWT + Vexxen refresh token. */
export interface AuthSession {
  jwt: string;
  refreshToken: string;
}

/** Plan status of the caller's company, as the backend reports it. */
export type PlanStatus = "trialing" | "active" | "canceling" | "past_due" | "none";

/** Backend `Auth/vexxen` / `Auth/refresh` when the person belongs to a company. */
export interface SignedInResult {
  status: "signed_in";
  jwt: string;
  /** Only on refresh: the new Vexxen refresh token (the previous one no longer works). */
  refreshToken: string | null;
  username: string;
  rol: string;
  identificationId: string;
  planStatus: PlanStatus;
}

/** Backend `Auth/vexxen` when the person has a Vexxen account but no EvalFlow company yet. */
export interface NeedsOnboardingResult {
  status: "needs_onboarding";
  email: string;
  firstName: string;
  lastName: string;
  /** They already have an EvalFlow plan (or trial) in Vexxen: they can create their company now. */
  hasPlan: boolean;
  /** The Vexxen catalog with EvalFlow open: where to pick a plan and start the free trial. */
  catalogUrl: string;
}

export type VexxenSignInResult = SignedInResult | NeedsOnboardingResult;

/** A single feature granted by a role: its code plus a human-readable description. */
export interface Feature {
  code: string;
  description: string;
}

/**
 * Mirrors the backend `Auth/my-features` response: the caller's role, the
 * features granted to it, and the role's own description. `features` is
 * empty when the role was not found or has none configured (backend answers
 * 404 in both cases).
 */
export interface MyFeatures {
  role: string;
  features: Feature[];
  description: string;
}
