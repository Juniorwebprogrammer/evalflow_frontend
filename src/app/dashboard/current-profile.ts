import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { useCases } from "@/core/di/container";
import type { Profile } from "@/features/profile/domain/profile";

/**
 * The signed-in user's profile, or a redirect to /login when there is no
 * session or the token is invalid/expired (or the backend is unreachable).
 * Memoized per request with `cache`, so the dashboard layout and its page
 * share a single `Profile/me` call.
 */
export const getCurrentProfile = cache(async (): Promise<Profile> => {
  const session = await readSession();
  if (!session) redirect("/login");

  try {
    return await useCases.getMyProfile.execute(session.jwt);
  } catch {
    redirect("/login");
  }
});
