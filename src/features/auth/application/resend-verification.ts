import type { ResendVerificationResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Requests a fresh email-verification link against the backend
 * `Auth/resend-verification`. Public flow — no session required. The
 * backend always answers the same generic message regardless of whether the
 * email matched or was already verified, so there's nothing to leak either
 * way.
 */
export class ResendVerification {
  constructor(private readonly auth: AuthRepository) {}

  async execute(email: string): Promise<ResendVerificationResult> {
    if (!email.trim()) {
      throw new DomainError("El correo electrónico es obligatorio", 400);
    }
    return this.auth.resendVerification({ Email: email });
  }
}
