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
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!input.CurrentPassword) {
      throw new DomainError("La contraseña actual es obligatoria", 400);
    }
    if (input.NewPassword.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        400,
      );
    }
    if (input.NewPassword === input.CurrentPassword) {
      throw new DomainError(
        "La nueva contraseña debe ser distinta de la actual",
        400,
      );
    }
    return this.profiles.changePassword(input, accessToken);
  }
}
