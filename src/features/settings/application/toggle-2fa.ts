import type { Toggle2FAResult } from "@/features/settings/domain/settings";
import type { SettingsRepository } from "@/features/settings/domain/settings-repository";
import { DomainError } from "@/core/errors/errors";

/**
 * Enables/disables 2FA for the authenticated user against the backend
 * `Settings/2fa`.
 */
export class Toggle2FA {
  constructor(private readonly settings: SettingsRepository) {}

  async execute(
    userId: number | null,
    enable: boolean,
    accessToken: string,
  ): Promise<Toggle2FAResult> {
    if (!accessToken) {
      throw new DomainError("Sesión no válida. Vuelve a iniciar sesión.", 401);
    }
    if (!userId) {
      throw new DomainError("No se pudo identificar al usuario.", 401);
    }
    return this.settings.toggle2FA({ UserId: userId, Enable: enable }, accessToken);
  }
}
