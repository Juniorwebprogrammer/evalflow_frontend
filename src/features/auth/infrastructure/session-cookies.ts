import "server-only";
import { cookies } from "next/headers";
import type { AuthSession } from "@/features/auth/domain/auth";
import {
  JWT_COOKIE,
  JWT_MAX_AGE,
  PENDING_ACCESS_COOKIE,
  PENDING_MAX_AGE,
  PENDING_REFRESH_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  sessionCookieOptions,
} from "@/features/auth/infrastructure/session-config";

/**
 * Persists the auth tokens as httpOnly cookies. Must be called from a Route
 * Handler or Server Action (cookies cannot be set during RSC rendering).
 */
export async function persistSession(session: AuthSession): Promise<void> {
  const store = await cookies();
  const base = sessionCookieOptions();

  store.set(JWT_COOKIE, session.jwt, { ...base, maxAge: JWT_MAX_AGE });
  store.set(REFRESH_COOKIE, session.refreshToken, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
}

/** Reads the current session, if any. */
export async function readSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const jwt = store.get(JWT_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!jwt || !refreshToken) return null;
  return { jwt, refreshToken };
}

/** Clears the session cookies (logout), the pending onboarding ones included. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(JWT_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(PENDING_ACCESS_COOKIE);
  store.delete(PENDING_REFRESH_COOKIE);
}

/** Vexxen tokens of someone who still has to create their company (onboarding). */
export interface PendingVexxenSession {
  accessToken: string;
  refreshToken: string;
}

export async function persistPendingVexxen(pending: PendingVexxenSession): Promise<void> {
  const store = await cookies();
  const base = sessionCookieOptions();
  store.set(PENDING_ACCESS_COOKIE, pending.accessToken, { ...base, maxAge: PENDING_MAX_AGE });
  store.set(PENDING_REFRESH_COOKIE, pending.refreshToken, { ...base, maxAge: PENDING_MAX_AGE });
}

export async function readPendingVexxen(): Promise<PendingVexxenSession | null> {
  const store = await cookies();
  const accessToken = store.get(PENDING_ACCESS_COOKIE)?.value;
  const refreshToken = store.get(PENDING_REFRESH_COOKIE)?.value;
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function clearPendingVexxen(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_ACCESS_COOKIE);
  store.delete(PENDING_REFRESH_COOKIE);
}
