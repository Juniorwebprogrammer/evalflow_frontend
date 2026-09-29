import type { LoginInput, LoginResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Authenticates a user against the backend `Auth/login` endpoint.
 * Validates the credentials before delegating to the auth repository.
 */
export class LoginUser {
  constructor(private readonly auth: AuthRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    if (!input.Email.trim()) {
      throw new DomainError("Email is required", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.Email)) {
      throw new DomainError("Email is not valid", 400);
    }
    if (!input.Password) {
      throw new DomainError("Password is required", 400);
    }
    return this.auth.login(input);
  }
}
