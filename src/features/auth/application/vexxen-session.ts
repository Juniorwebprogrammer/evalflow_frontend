import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import type { SignedInResult, VexxenSignInResult } from "@/features/auth/domain/auth";
import { DomainError } from "@/core/errors/errors";

/** Exchanges the Vexxen access token from the popup for an EvalFlow session (or "needs onboarding"). */
export class SignInWithVexxen {
  constructor(private readonly auth: AuthRepository) {}

  execute(vexxenAccessToken: string): Promise<VexxenSignInResult> {
    if (!vexxenAccessToken) throw new DomainError("Sign in with Vexxen first.", 401);
    return this.auth.signInWithVexxen(vexxenAccessToken);
  }
}

/** Renews the session at Vexxen with its refresh token: a new JWT and a new refresh token. */
export class RefreshSession {
  constructor(private readonly auth: AuthRepository) {}

  execute(refreshToken: string): Promise<SignedInResult> {
    if (!refreshToken) throw new DomainError("Your session has expired. Please sign in again.", 401);
    return this.auth.refreshSession(refreshToken);
  }
}

/** Revokes the Vexxen refresh token. Never fails: the cookies are cleared anyway. */
export class Logout {
  constructor(private readonly auth: AuthRepository) {}

  async execute(refreshToken: string | null): Promise<void> {
    if (refreshToken) await this.auth.logout(refreshToken);
  }
}
