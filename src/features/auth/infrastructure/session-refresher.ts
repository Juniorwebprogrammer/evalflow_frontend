import "server-only";
import { BackendClient } from "@/core/http/backend-client";
import { DomainError } from "@/core/errors/errors";
import { RefreshSession } from "@/features/auth/application/vexxen-session";
import { HttpAuthRepository } from "@/features/auth/infrastructure/http-auth-repository";

export type RefreshOutcome =
  | { kind: "renewed"; jwt: string; refreshToken: string }
  /** Vexxen says the session is over (password changed, account deleted, signed out elsewhere…). */
  | { kind: "expired" }
  /** Vexxen or the backend didn't answer: keep going with what we have and try again later. */
  | { kind: "unavailable" };

const refreshSession = new RefreshSession(new HttpAuthRepository(new BackendClient()));

// A page load fires several requests at once. Vexxen refresh tokens are single-use, so the requests that
// arrive with the same refresh token share one renewal instead of racing (the losers would log the user out).
const inFlight = new Map<string, Promise<RefreshOutcome>>();
const RECENT_MS = 30_000;

export function refreshOnce(refreshToken: string): Promise<RefreshOutcome> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const outcome = refresh(refreshToken);
  inFlight.set(refreshToken, outcome);
  // Keep the result a little longer for requests that were already on their way with the old token.
  outcome.finally(() => setTimeout(() => inFlight.delete(refreshToken), RECENT_MS));
  return outcome;
}

async function refresh(refreshToken: string): Promise<RefreshOutcome> {
  try {
    const session = await refreshSession.execute(refreshToken);
    if (!session.refreshToken) return { kind: "unavailable" };
    return { kind: "renewed", jwt: session.jwt, refreshToken: session.refreshToken };
  } catch (error) {
    // 401 (expired, revoked, no longer a member) and 403 (account disabled) end the session.
    if (error instanceof DomainError && (error.status === 401 || error.status === 403)) return { kind: "expired" };
    console.error("[session] couldn't renew the session:", error);
    return { kind: "unavailable" };
  }
}

/** Seconds until the JWT expires (from its `exp` claim, unverified: the backend verifies it). */
export function secondsLeft(jwt: string): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf-8")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : 0;
  } catch {
    return 0;
  }
}
