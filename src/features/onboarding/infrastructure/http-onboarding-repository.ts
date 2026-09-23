import "server-only";
import type {
  RegisterOwnerInput,
  RegisterOwnerResult,
} from "@/features/onboarding/domain/registration";
import type { OnboardingRepository } from "@/features/onboarding/domain/onboarding-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend RegisterOwnerResponse (PascalCase). */
interface RegisterOwnerDto {
  Message?: string;
  message?: string;
  UserNombre?: string;
  userNombre?: string;
  Jwt?: string;
  jwt?: string;
  RefreshToken?: string;
  refreshToken?: string;
}

export class HttpOnboardingRepository implements OnboardingRepository {
  constructor(private readonly client: BackendClient) {}

  async registerOwner(input: RegisterOwnerInput): Promise<RegisterOwnerResult> {
    const dto = await this.client.request<RegisterOwnerDto>(
      "/Onboarding/register-owner",
      { method: "POST", body: input },
    );

    if (!dto) {
      throw new UpstreamError("El servidor no devolvió una respuesta de registro");
    }

    const jwt = dto.Jwt ?? dto.jwt;
    const refreshToken = dto.RefreshToken ?? dto.refreshToken;
    if (!jwt || !refreshToken) {
      throw new UpstreamError("La respuesta de registro es incompleta");
    }

    return {
      message: dto.Message ?? dto.message ?? "Registro completado",
      userNombre: dto.UserNombre ?? dto.userNombre ?? input.UserNombre,
      jwt,
      refreshToken,
    };
  }
}
