import type { AuthTokensResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Exchanges the emailed 2FA code for session tokens against the backend
 * `Auth/verify-2fa`. Public flow — no session required yet.
 */
export class Verify2FA {
  constructor(private readonly auth: AuthRepository) {}

  async execute(email: string, code: string): Promise<AuthTokensResult> {
    if (!email.trim()) {
      throw new DomainError("El correo electrónico es obligatorio", 400);
    }
    if (!code.trim()) {
      throw new DomainError("El código es obligatorio", 400);
    }
    return this.auth.verify2FA({ Email: email, Code: code });
  }
}
