import "server-only";
import type { Feature, MyFeatures, SignedInResult, VexxenSignInResult } from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend feature entry (PascalCase, tolerant to variations). */
interface FeatureDto {
  Code?: string;
  code?: string;
  Description?: string;
  description?: string;
}

/** Raw backend `Auth/my-features` response (PascalCase, tolerant to variations). */
interface MyFeaturesDto {
  Role?: string;
  role?: string;
  Features?: FeatureDto[];
  features?: FeatureDto[];
  Description?: string;
  description?: string;
}

function toFeature(dto: FeatureDto): Feature {
  return {
    code: dto.Code ?? dto.code ?? "",
    description: dto.Description ?? dto.description ?? "",
  };
}

/** Backend `Auth/vexxen` / `Auth/refresh` (camelCase from the minimal APIs). */
interface SessionDto {
  status?: string;
  jwt?: string;
  refreshToken?: string | null;
  username?: string;
  rol?: string;
  identificationId?: string;
  planStatus?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  hasPlan?: boolean;
  catalogUrl?: string;
}

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly client: BackendClient) {}

  async signInWithVexxen(vexxenAccessToken: string): Promise<VexxenSignInResult> {
    const dto = await this.client.request<SessionDto>("/Auth/vexxen", {
      method: "POST",
      body: { accessToken: vexxenAccessToken },
    });
    if (dto?.status === "needs_onboarding") {
      return {
        status: "needs_onboarding",
        email: String(dto.email ?? ""),
        firstName: String(dto.firstName ?? ""),
        lastName: String(dto.lastName ?? ""),
        hasPlan: Boolean(dto.hasPlan),
        catalogUrl: String(dto.catalogUrl ?? ""),
      };
    }
    return toSignedIn(dto);
  }

  async refreshSession(refreshToken: string): Promise<SignedInResult> {
    const dto = await this.client.request<SessionDto>("/Auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    return toSignedIn(dto);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.client.request("/Auth/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
  }

  async getMyFeatures(accessToken: string): Promise<MyFeatures> {
    // The backend answers 404 both when the role doesn't exist and when it
    // has no features configured; either way it's a legitimate "empty"
    // result, not a failure, so it is not thrown.
    const dto = await this.client.request<MyFeaturesDto>("/auth/my-features", {
      method: "GET",
      accessToken,
      allowNotFound: true,
    });

    const rawFeatures = dto?.Features ?? dto?.features ?? [];

    return {
      role: dto?.Role ?? dto?.role ?? "",
      features: rawFeatures.map(toFeature),
      description: dto?.Description ?? dto?.description ?? "",
    };
  }}

function toSignedIn(dto: SessionDto | null): SignedInResult {
  if (dto?.status !== "signed_in" || !dto.jwt) {
    throw new UpstreamError("The EvalFlow server sent an unexpected sign-in response.");
  }
  return {
    status: "signed_in",
    jwt: dto.jwt,
    refreshToken: dto.refreshToken ?? null,
    username: String(dto.username ?? ""),
    rol: String(dto.rol ?? ""),
    identificationId: String(dto.identificationId ?? ""),
    planStatus: (dto.planStatus ?? "none") as SignedInResult["planStatus"],
  };
}
