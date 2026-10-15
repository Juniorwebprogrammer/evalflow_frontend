import type { MyFeatures, SignedInResult, VexxenSignInResult } from "@/features/auth/domain/auth";

export interface AuthRepository {
  /** Exchanges a Vexxen access token (from the popup) for an EvalFlow session or "needs onboarding". */
  signInWithVexxen(vexxenAccessToken: string): Promise<VexxenSignInResult>;
  /** Renews the session at Vexxen: new JWT and new Vexxen refresh token. */
  refreshSession(refreshToken: string): Promise<SignedInResult>;
  /** Revokes the Vexxen refresh token. Never throws. */
  logout(refreshToken: string): Promise<void>;
  getMyFeatures(accessToken: string): Promise<MyFeatures>;
}
