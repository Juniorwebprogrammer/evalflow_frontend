import "server-only";
import type {
  Toggle2FAInput,
  Toggle2FAResult,
} from "@/features/settings/domain/settings";
import type { SettingsRepository } from "@/features/settings/domain/settings-repository";
import { BackendClient } from "@/core/http/backend-client";

/** Raw backend `Settings/2fa` response (PascalCase, tolerant to variations). */
interface Toggle2FADto {
  Message?: string;
  message?: string;
}

export class HttpSettingsRepository implements SettingsRepository {
  constructor(private readonly client: BackendClient) {}

  async toggle2FA(
    input: Toggle2FAInput,
    accessToken: string,
  ): Promise<Toggle2FAResult> {
    const dto = await this.client.request<Toggle2FADto>("/settings/2fa", {
      method: "PUT",
      accessToken,
      body: { UserId: input.UserId, Enable: input.Enable },
    });

    return {
      message:
        dto?.Message ??
        dto?.message ??
        `Autenticación de dos factores ${input.Enable ? "activada" : "desactivada"} correctamente`,
    };
  }
}
