import type { ForgotPasswordResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Requests a password-reset link against the backend `Auth/forgot-password`.
 * Public flow — no session required. The backend always answers the same
 * generic message regardless of whether the email matched an active
 * account, so there's nothing to leak either way.
 */
export class ForgotPassword {
  constructor(private readonly auth: AuthRepository) {}

  async execute(email: string): Promise<ForgotPasswordResult> {
    if (!email.trim()) {
      throw new DomainError("El correo electrónico es obligatorio", 400);
    }
    return this.auth.forgotPassword({ Email: email });
  }
}
