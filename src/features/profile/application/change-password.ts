import type { ChangePasswordInput } from "@/features/profile/domain/profile";
import type { ProfileRepository } from "@/features/profile/domain/profile-repository";
import { DomainError } from "@/core/errors/errors";

/** Minimum length required for a new password (matches the UI copy). */
const MIN_PASSWORD_LENGTH = 12;

/** Changes the authenticated user's password via `Profile/change-password`. */
export class ChangePassword {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(
    input: ChangePasswordInput,
    accessToken: string,
  ): Promise<void> {
    if (!accessToken) {
      throw new DomainError("Invalid session. Please sign in again.", 401);
    }
    if (!input.CurrentPassword) {
      throw new DomainError("Current password is required.", 400);
    }
    if (input.NewPassword.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        400,
      );
    }
    if (input.NewPassword === input.CurrentPassword) {
      throw new DomainError(
        "New password must be different from your current one.",
        400,
      );
    }
    return this.profiles.changePassword(input, accessToken);
  }
}
