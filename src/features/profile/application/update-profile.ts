import type { UpdateProfileInput } from "@/features/profile/domain/profile";
import type { ProfileRepository } from "@/features/profile/domain/profile-repository";
import { DomainError } from "@/core/errors/errors";

/** Updates the authenticated user's profile via the backend `Profile/update`. */
export class UpdateProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(
    input: UpdateProfileInput,
    accessToken: string,
  ): Promise<void> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!input.Nombre.trim()) {
      throw new DomainError("First name is required.", 400);
    }
    if (!input.Apellidos.trim()) {
      throw new DomainError("Last name is required.", 400);
    }
    return this.profiles.update(input, accessToken);
  }
}
