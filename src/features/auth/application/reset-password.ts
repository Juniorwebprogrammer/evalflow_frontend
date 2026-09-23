import type { ResetPasswordResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/** Minimum length required for a new password (matches the UI copy, same as `ChangePassword`). */
const MIN_PASSWORD_LENGTH = 12;

/**
 * Sets a new password from the token carried by the password-reset email
 * link, against the backend `Auth/reset-password`. Public flow — no session
 * required. Invalid/expired tokens are surfaced by the backend itself.
 */
export class ResetPassword {
  constructor(private readonly auth: AuthRepository) {}

  async execute(token: string, newPassword: string): Promise<ResetPasswordResult> {
    if (!token.trim()) {
      throw new DomainError("El enlace de recuperación no es válido.", 400);
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new DomainError(
        `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        400,
      );
    }
    return this.auth.resetPassword({ Token: token, NewPassword: newPassword });
  }
}
