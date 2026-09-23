import "server-only";
import type {
  Profile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/features/profile/domain/profile";
import type { ProfileRepository } from "@/features/profile/domain/profile-repository";
import { BackendClient } from "@/core/http/backend-client";
import { UpstreamError } from "@/core/errors/errors";

/** Raw backend GetProfileInformationDTO (PascalCase, tolerant to variations). */
interface ProfileDto {
  Nombre?: string;
  nombre?: string;
  Apellidos?: string;
  apellidos?: string;
  Email?: string;
  email?: string;
  Rol?: string;
  rol?: string;
  FechaCreacion?: string;
  fechaCreacion?: string;
  NombreEmpresa?: string;
  nombreEmpresa?: string;
  IdentificationId?: string | number;
  identificationId?: string | number;
  Sector?: string;
  sector?: string;
  PlanId?: number;
  planId?: number;
  DireccionFiscal?: string;
  direccionFiscal?: string;
  Cif?: string;
  cif?: string;
  TwoFactorAuthentication?: boolean;
  twoFactorAuthentication?: boolean;
}

export class HttpProfileRepository implements ProfileRepository {
  constructor(private readonly client: BackendClient) {}

  async getMe(accessToken: string): Promise<Profile> {
    const dto = await this.client.request<ProfileDto>("/Profile/me", {
      method: "GET",
      accessToken,
    });

    if (!dto) {
      throw new UpstreamError("El servidor no devolvió el perfil");
    }

    return {
      nombre: dto.Nombre ?? dto.nombre ?? "",
      apellidos: dto.Apellidos ?? dto.apellidos ?? "",
      email: dto.Email ?? dto.email ?? "",
      rol: dto.Rol ?? dto.rol ?? "",
      fechaCreacion: dto.FechaCreacion ?? dto.fechaCreacion ?? "",
      nombreEmpresa: dto.NombreEmpresa ?? dto.nombreEmpresa ?? "",
      identificationId: String(
        dto.IdentificationId ?? dto.identificationId ?? "",
      ),
      sector: dto.Sector ?? dto.sector ?? "",
      planId: dto.PlanId ?? dto.planId ?? 0,
      direccionFiscal: dto.DireccionFiscal ?? dto.direccionFiscal ?? "",
      cif: dto.Cif ?? dto.cif ?? "",
      twoFactorEnabled: Boolean(
        dto.TwoFactorAuthentication ?? dto.twoFactorAuthentication ?? false,
      ),
    };
  }

  async update(
    input: UpdateProfileInput,
    accessToken: string,
  ): Promise<void> {
    await this.client.request<unknown>("/Profile/update", {
      method: "PUT",
      accessToken,
      body: {
        Nombre: input.Nombre,
        Apellidos: input.Apellidos,
      },
    });
  }

  async changePassword(
    input: ChangePasswordInput,
    accessToken: string,
  ): Promise<void> {
    await this.client.request<unknown>("/Profile/change-password", {
      method: "PUT",
      accessToken,
      body: {
        CurrentPassword: input.CurrentPassword,
        NewPassword: input.NewPassword,
      },
    });
  }
}
