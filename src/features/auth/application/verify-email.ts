import type { VerifyEmailResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Validates the token carried by the email verification link against the
 * backend `Auth/verify-email`. Public flow — no session required.
 */
export class VerifyEmail {
  constructor(private readonly auth: AuthRepository) {}

  async execute(token: string): Promise<VerifyEmailResult> {
    if (!token.trim()) {
      throw new DomainError("El enlace de verificación no es válido.", 400);
    }
    return this.auth.verifyEmail({ Token: token });
  }
}
