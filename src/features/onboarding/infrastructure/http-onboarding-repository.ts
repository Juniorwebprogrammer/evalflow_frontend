import "server-only";
import type {
  RegisterOwnerInput,
  RegisterOwnerResult,
} from "@/features/onboarding/domain/registration";
import type { OnboardingRepository } from "@/features/onboarding/domain/onboarding-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend RegisterOwnerResponse (camelCase from the minimal APIs). */
interface RegisterOwnerDto {
  message?: string;
  userNombre?: string;
  jwt?: string;
  identificationId?: string;
  planId?: number;
  planStatus?: string;
}

export class HttpOnboardingRepository implements OnboardingRepository {
  constructor(private readonly client: BackendClient) {}

  async registerOwner(input: RegisterOwnerInput, vexxenAccessToken: string): Promise<RegisterOwnerResult> {
    const dto = await this.client.request<RegisterOwnerDto>(
      "/Onboarding/register-owner",
      { method: "POST", body: { ...input, VexxenAccessToken: vexxenAccessToken } },
    );

    if (!dto?.jwt) {
      throw new UpstreamError("The registration response is incomplete");
    }

    return {
      message: dto.message ?? "Registration completed",
      userNombre: dto.userNombre ?? "",
      jwt: dto.jwt,
      identificationId: dto.identificationId ?? "",
      planId: Number(dto.planId ?? 0),
      planStatus: dto.planStatus ?? "none",
    };
  }
}
