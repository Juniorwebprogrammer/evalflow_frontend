import type { ProfileRepository } from "@/features/profile/domain/profile-repository";
import type { BackendFile } from "@/core/http/backend-client";
import { DomainError } from "@/core/errors/errors";

/** Roughly the backend's 512 KB image limit, expressed as base64 length. */
const MAX_BASE64_LENGTH = Math.ceil((512 * 1024 * 4) / 3) + 64;

function requireToken(accessToken: string) {
  if (!accessToken) {
    throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
  }
}

/** Replaces the caller's profile picture via the backend `PUT Profile/avatar`. */
export class UploadAvatar {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(data: string, accessToken: string): Promise<string | null> {
    requireToken(accessToken);
    if (!data.trim()) {
      throw new DomainError("Selecciona una imagen", 400);
    }
    if (data.length > MAX_BASE64_LENGTH) {
      throw new DomainError("La imagen es demasiado grande", 400);
    }
    return this.profiles.uploadAvatar(data, accessToken);
  }
}

/** Removes the caller's profile picture via the backend `DELETE Profile/avatar`. */
export class DeleteAvatar {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(accessToken: string): Promise<void> {
    requireToken(accessToken);
    return this.profiles.deleteAvatar(accessToken);
  }
}

/** Downloads the caller's profile picture via the backend `GET Profile/avatar`. */
export class GetAvatar {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(accessToken: string): Promise<BackendFile> {
    requireToken(accessToken);
    return this.profiles.getAvatar(accessToken);
  }
}
