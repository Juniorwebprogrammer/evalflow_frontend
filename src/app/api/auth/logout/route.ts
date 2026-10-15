import { useCases } from "@/core/di/container";
import { clearSession, readSession } from "@/features/auth/infrastructure/session-cookies";

/**
 * POST /api/auth/logout
 * Revokes the Vexxen refresh token and clears the cookies. Always 204: signing out can't fail for the user.
 */
export async function POST() {
  const session = await readSession();
  await useCases.logout.execute(session?.refreshToken ?? null);
  await clearSession();
  return new Response(null, { status: 204 });
}
