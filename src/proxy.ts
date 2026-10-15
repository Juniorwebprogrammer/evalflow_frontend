import { NextResponse, type NextRequest } from "next/server";
import {
  JWT_COOKIE,
  JWT_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  sessionCookieOptions,
} from "@/features/auth/infrastructure/session-config";
import { refreshOnce, secondsLeft } from "@/features/auth/infrastructure/session-refresher";

// Renew a little before the JWT expires, so a request never reaches the backend with a token about to die.
const RENEW_BEFORE_SECONDS = 2 * 60;

/**
 * Keeps the session alive: when the EvalFlow JWT is missing or about to expire and there's a Vexxen refresh
 * token, renews it (backend `Auth/refresh`, which renews at Vexxen) before the request reaches the page or
 * the route handler. Pages and handlers keep reading the cookies as always. If Vexxen says the session is
 * over, the cookies are dropped: pages send the user to /login and the API answers 401.
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const jwt = request.cookies.get(JWT_COOKIE)?.value;
  if (!refreshToken || (jwt && secondsLeft(jwt) > RENEW_BEFORE_SECONDS)) return NextResponse.next();

  const outcome = await refreshOnce(refreshToken);
  if (outcome.kind === "unavailable") return NextResponse.next();

  if (outcome.kind === "expired") {
    request.cookies.delete(JWT_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.delete(JWT_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  // The new tokens go both upstream (this request) and to the browser (the next ones).
  request.cookies.set(JWT_COOKIE, outcome.jwt);
  request.cookies.set(REFRESH_COOKIE, outcome.refreshToken);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(JWT_COOKIE, outcome.jwt, { ...sessionCookieOptions(), maxAge: JWT_MAX_AGE });
  response.cookies.set(REFRESH_COOKIE, outcome.refreshToken, { ...sessionCookieOptions(), maxAge: REFRESH_MAX_AGE });
  return response;
}

export const config = {
  // Everything but static assets and the Vexxen sign-in/sign-out routes (they set the cookies themselves).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/vexxen|api/auth/logout|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)"],
};
