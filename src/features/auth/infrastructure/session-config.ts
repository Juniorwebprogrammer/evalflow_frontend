/**
 * Session cookie names and options, without `next/headers`: shared by the
 * cookie helpers (route handlers, server actions) and by the proxy.
 */
export const JWT_COOKIE = "ef_jwt";
/** Vexxen's refresh token: renewing it at Vexxen (`Auth/refresh`) keeps the EvalFlow session alive. */
export const REFRESH_COOKIE = "ef_refresh";
// Signed in with Vexxen but without an EvalFlow company yet (onboarding): the Vexxen tokens wait here until
// the company is created. Kept apart from ef_refresh so the proxy never tries to renew a non-member session.
export const PENDING_ACCESS_COOKIE = "ef_vx_access";
export const PENDING_REFRESH_COOKIE = "ef_vx_refresh";

// The JWT is short-lived; the refresh token lives longer (as Vexxen's does).
export const JWT_MAX_AGE = 60 * 60; // 1 hour
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
// Vexxen access tokens last 15 minutes: enough to create the company.
export const PENDING_MAX_AGE = 15 * 60;

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});
