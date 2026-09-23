import type { Profile } from "@/features/profile/domain/profile";
import type { ProfileRepository } from "@/features/profile/domain/profile-repository";
import { DomainError } from "@/core/errors/errors";

/** Fetches the authenticated user's profile from the backend `Profile/me`. */
export class GetMyProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(accessToken: string): Promise<Profile> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    return this.profiles.getMe(accessToken);
  }
}
