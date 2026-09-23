import "server-only";
import { cookies } from "next/headers";
import type { AuthSession } from "@/features/auth/domain/auth";

const JWT_COOKIE = "ef_jwt";
const REFRESH_COOKIE = "ef_refresh";

// The JWT is short-lived; the refresh token lives longer.
const JWT_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Persists the auth tokens as httpOnly cookies. Must be called from a Route
 * Handler or Server Action (cookies cannot be set during RSC rendering).
 */
export async function persistSession(session: AuthSession): Promise<void> {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };

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

/** Clears the session cookies (logout). */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(JWT_COOKIE);
  store.delete(REFRESH_COOKIE);
}
