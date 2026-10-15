import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET  /api/profile  → the authenticated user's profile (backend `Profile/me`).
 * The name is edited in Vexxen (and copied on sign-in), so there's no PUT.
 *
 * Reads the caller's JWT from the session cookie and forward it as a bearer
 * token; the api key is added server-side by the BackendClient.
 */
export async function GET() {
  try {
    const session = await requireSession();
    const profile = await useCases.getMyProfile.execute(session.jwt);
    return Response.json({ profile });
  } catch (error) {
    return handleError(error);
  }
}

async function requireSession() {
  const session = await readSession();
  if (!session) {
    throw new DomainError("Your session has expired. Please sign in again.", 401);
  }
  return session;
}
