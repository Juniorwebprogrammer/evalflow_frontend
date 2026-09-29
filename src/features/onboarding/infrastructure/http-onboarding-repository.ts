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
      throw new UpstreamError("The server did not return a registration response");
    }

    const jwt = dto.Jwt ?? dto.jwt;
    const refreshToken = dto.RefreshToken ?? dto.refreshToken;
    if (!jwt || !refreshToken) {
      throw new UpstreamError("The registration response is incomplete");
    }

    return {
      message: dto.Message ?? dto.message ?? "Registration completed",
      userNombre: dto.UserNombre ?? dto.userNombre ?? input.UserNombre,
      jwt,
      refreshToken,
    };
  }
}
