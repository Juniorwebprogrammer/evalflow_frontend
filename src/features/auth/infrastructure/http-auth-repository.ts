import "server-only";
import type {
  LoginInput,
  LoginResult,
  MyFeatures,
  Feature,
  VerifyEmailInput,
  VerifyEmailResult,
  AuthTokensResult,
  Verify2FAInput,
  Resend2FAInput,
  Resend2FAResult,
  ResendVerificationInput,
  ResendVerificationResult,
  ForgotPasswordInput,
  ForgotPasswordResult,
  ResetPasswordInput,
  ResetPasswordResult,
} from "@/features/auth/domain/auth";
import type { AuthRepository } from "@/features/auth/domain/auth-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/**
 * Raw backend LoginResponse (PascalCase, tolerant to variations). Also
 * covers the 2FA-challenge shape (`Requires2FA` + `Email`, no tokens) and the
 * `Auth/verify-2fa` success shape (same as a normal login).
 */
interface LoginDto {
  Message?: string;
  message?: string;
  Username?: string;
  username?: string;
  Jwt?: string;
  jwt?: string;
  RefreshToken?: string;
  refreshToken?: string;
  Requires2FA?: boolean;
  requires2FA?: boolean;
  Email?: string;
  email?: string;
}

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

/**
 * Raw backend `Auth/verify-email` response (PascalCase, tolerant to
 * variations). `TenantId` is only present once the account has a company.
 */
interface VerifyEmailDto {
  Message?: string;
  message?: string;
  TenantId?: string | number | null;
  tenantId?: string | number | null;
}

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly client: BackendClient) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const dto = await this.client.request<LoginDto>("/Auth/login", {
      method: "POST",
      body: {
        Email: input.Email,
        Password: input.Password,
        IdentificationId: input.IdentificationId,
      },
    });

    if (!dto) {
      throw new UpstreamError("El servidor no devolvió una respuesta de acceso");
    }

    if (dto.Requires2FA ?? dto.requires2FA ?? false) {
      return {
        requires2FA: true,
        message: dto.Message ?? dto.message ?? "Código 2FA enviado al correo.",
        email: dto.Email ?? dto.email ?? input.Email,
      };
    }

    const jwt = dto.Jwt ?? dto.jwt;
    const refreshToken = dto.RefreshToken ?? dto.refreshToken;
    if (!jwt || !refreshToken) {
      throw new UpstreamError("La respuesta de acceso es incompleta");
    }

    return {
      requires2FA: false,
      message: dto.Message ?? dto.message ?? "Acceso correcto",
      username: dto.Username ?? dto.username ?? "",
      jwt,
      refreshToken,
    };
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
  }

  async verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResult> {
    // Invalid/expired/unknown tokens come back as 400 with a Message (not
    // 404), so the generic error path in BackendClient already surfaces them.
    const dto = await this.client.request<VerifyEmailDto>("/auth/verify-email", {
      method: "POST",
      body: { Token: input.Token },
    });

    if (!dto) {
      throw new UpstreamError("El servidor no devolvió una respuesta de verificación");
    }

    const tenantId = dto.TenantId ?? dto.tenantId ?? null;

    return {
      message: dto.Message ?? dto.message ?? "Correo electrónico verificado",
      tenantId: tenantId == null ? null : String(tenantId),
    };
  }

  async verify2FA(input: Verify2FAInput): Promise<AuthTokensResult> {
    // Wrong/expired/missing codes come back as 400 with a Message, which the
    // generic error path in BackendClient already surfaces.
    const dto = await this.client.request<LoginDto>("/auth/verify-2fa", {
      method: "POST",
      body: { Email: input.Email, Code: input.Code },
    });

    if (!dto) {
      throw new UpstreamError("El servidor no devolvió una respuesta de verificación");
    }

    const jwt = dto.Jwt ?? dto.jwt;
    const refreshToken = dto.RefreshToken ?? dto.refreshToken;
    if (!jwt || !refreshToken) {
      throw new UpstreamError("La respuesta de verificación es incompleta");
    }

    return {
      message: dto.Message ?? dto.message ?? "Autenticación completada",
      username: dto.Username ?? dto.username ?? "",
      jwt,
      refreshToken,
    };
  }

  async resend2FA(input: Resend2FAInput): Promise<Resend2FAResult> {
    // The backend always answers 200 with a generic message, whether or not
    // the email/2FA state actually matched — nothing to branch on here.
    const dto = await this.client.request<{ Message?: string; message?: string }>(
      "/auth/resend-2fa",
      { method: "POST", body: { Email: input.Email } },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Si el correo está registrado y el 2FA activado, se ha enviado un nuevo código.",
    };
  }

  async resendVerification(
    input: ResendVerificationInput,
  ): Promise<ResendVerificationResult> {
    // The backend always answers 200 with a generic message, whether or not
    // the email matched or was already verified — nothing to branch on here.
    const dto = await this.client.request<{ Message?: string; message?: string }>(
      "/auth/resend-verification",
      { method: "POST", body: { Email: input.Email } },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Si el correo está registrado y pendiente de verificación, se ha enviado un nuevo enlace.",
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    // The backend always answers 200 with a generic message, whether or not
    // the email matched an active account — nothing to branch on here.
    const dto = await this.client.request<{ Message?: string; message?: string }>(
      "/auth/forgot-password",
      { method: "POST", body: { Email: input.Email } },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.",
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    // Invalid/expired tokens come back as 400 with a Message (not 404), so
    // the generic error path in BackendClient already surfaces them.
    const dto = await this.client.request<{ Message?: string; message?: string }>(
      "/auth/reset-password",
      { method: "POST", body: { Token: input.Token, NewPassword: input.NewPassword } },
    );

    return {
      message:
        dto?.Message ??
        dto?.message ??
        "Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión.",
    };
  }
}
