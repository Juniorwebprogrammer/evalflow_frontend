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

/** Side of the square profile picture we upload (px). */
const AVATAR_SIZE = 256;
/** Largest original file accepted before resizing. */
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/** URL of the current profile picture; `version` (its `avatarUpdatedAt`) busts the cache. */
export function avatarUrl(version: string): string {
  return `/api/profile/avatar?v=${encodeURIComponent(version)}`;
}

/**
 * Center-crops `file` to a square, scales it to 256×256 and re-encodes it as
 * JPEG in the browser — whatever the user picks (a 5 MB phone photo, a PNG
 * screenshot) uploads as a ~20–40 KB image well under the backend limit.
 */
async function toAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ApiError("Selecciona un archivo de imagen (JPG, PNG o WebP).", 400);
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ApiError("La imagen es demasiado grande (máximo 10 MB).", 400);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ApiError("No se pudo leer la imagen. Prueba con un JPG o PNG.", 400);
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new ApiError("Tu navegador no permite procesar la imagen.", 400);

  // White backdrop so transparent PNGs don't turn black as JPEG.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Resizes and uploads a new profile picture; resolves with its new `avatarUpdatedAt`. */
export async function uploadAvatar(file: File): Promise<string | null> {
  const data = await toAvatarDataUrl(file);
  const res = await fetch("/api/profile/avatar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
  const body = (await res.json()) as { avatarUpdatedAt: string | null };
  return body.avatarUpdatedAt;
}

/** Removes the current profile picture. */
export async function deleteAvatar(): Promise<void> {
  const res = await fetch("/api/profile/avatar", { method: "DELETE" });
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
}
