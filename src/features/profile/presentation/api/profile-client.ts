import type { Profile } from "@/features/profile/domain/profile";
import { ApiError, parseMessage } from "@/shared/lib/api-error";

/** Fetches the current user's profile from our own route handler. */
export async function fetchProfile(): Promise<Profile> {
  const res = await fetch("/api/profile", { method: "GET" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  const data = (await res.json()) as { profile: Profile };
  return data.profile;
}

/**
 * Updates the current user's profile via our own route handler. The bearer
 * token is added server-side from the session cookie, so it never touches the
 * browser.
 */
export async function updateProfile(input: {
  nombre: string;
  apellidos: string;
}): Promise<void> {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      Apellidos: input.apellidos,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
}

/** Changes the current user's password via our own route handler. */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch("/api/profile/change-password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      CurrentPassword: input.currentPassword,
      NewPassword: input.newPassword,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
}
