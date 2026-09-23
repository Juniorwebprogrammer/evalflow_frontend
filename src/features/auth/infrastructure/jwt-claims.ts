import "server-only";

/**
 * Reads the numeric user id from a JWT's `sub` claim, without verifying the
 * signature — this only extracts a claim we need to forward to endpoints
 * that require it in the body (e.g. `Settings/2fa`); the backend already
 * validates the token itself via `RequireAuthorization()`.
 *
 * Matches `JwtProvider.GenerateJwt`, which sets `sub` to `user.Id.ToString()`.
 */
export function readUserIdFromJwt(jwt: string): number | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;

    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const claims = JSON.parse(json) as { sub?: string };
    const id = Number(claims.sub);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
