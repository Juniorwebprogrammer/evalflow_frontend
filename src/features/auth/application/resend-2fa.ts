import type { Resend2FAResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Requests a fresh 2FA code be emailed against the backend `Auth/resend-2fa`.
 * Public flow — no session required. The backend always answers the same
 * generic message regardless of whether the email matched, so there's
 * nothing to leak here either way.
 */
export class Resend2FA {
  constructor(private readonly auth: AuthRepository) {}

  async execute(email: string): Promise<Resend2FAResult> {
    if (!email.trim()) {
      throw new DomainError("El correo electrónico es obligatorio", 400);
    }
    return this.auth.resend2FA({ Email: email });
  }
}
