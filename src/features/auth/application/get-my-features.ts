import type { MyFeatures } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Fetches the authenticated user's role, its granted features, and its
 * description from the backend `Auth/my-features`.
 */
export class GetMyFeatures {
  constructor(private readonly auth: AuthRepository) {}

  async execute(accessToken: string): Promise<MyFeatures> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    return this.auth.getMyFeatures(accessToken);
  }
}
