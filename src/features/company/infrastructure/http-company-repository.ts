import "server-only";
import type {
  Company,
  CompanyInfo,
  UpdateCompanyInput,
  DeleteCompanyInput,
} from "@/features/company/domain/company";
import type { CompanyRepository } from "@/features/company/domain/company-repository";
import { BackendClient } from "@/core/http/backend-client";

/** Raw shape as returned by the backend (PascalCase, tolerant to variations). */
interface CompanyDto {
  Id?: number;
  id?: number;
  Nombre?: string;
  nombre?: string;
  Colors?: string | null;
  colors?: string | null;
  IdentificationId?: number | null;
  identificationId?: number | null;
}

/** Raw shape of `Company/get/by-identification/{id}` (CompanyResponse). */
interface CompanyInfoDto {
  Nombre?: string;
  nombre?: string;
  // The backend property is `LogoURL` (PascalCase with the acronym kept
  // upper-case). System.Text.Json's default camelCase policy only lowercases
  // the *first* character of a leading uppercase run once it hits a
  // lowercase char two positions in, so "LogoURL" serializes to "logoURL"
  // (capital U-R-L kept), NOT "logoUrl" — easy to miss, tolerate both.
  LogoURL?: string | null;
  logoURL?: string | null;
  LogoUrl?: string | null;
  logoUrl?: string | null;
  Colors?: string | null;
  colors?: string | null;
  Cif?: string;
  cif?: string;
  Sector?: string;
  sector?: string;
  DireccionFiscal?: string;
  direccionFiscal?: string;
}

export class HttpCompanyRepository implements CompanyRepository {
  constructor(private readonly client: BackendClient) {}

  async getByName(name: string): Promise<Company | null> {
    const dto = await this.client.request<CompanyDto>(
      `/Company/get/by-name/${encodeURIComponent(name)}`,
      { allowNotFound: true },
    );
    if (!dto) return null;
    return this.toDomain(dto);
  }

  async getByIdentificationId(
    identificationId: string,
  ): Promise<CompanyInfo | null> {
    const dto = await this.client.request<CompanyInfoDto>(
      `/Company/get/by-identification/${encodeURIComponent(identificationId)}`,
      { allowNotFound: true },
    );
    if (!dto) return null;
    return {
      nombre: dto.Nombre ?? dto.nombre ?? "",
      logoUrl: dto.LogoURL ?? dto.logoURL ?? dto.LogoUrl ?? dto.logoUrl ?? null,
      colors: dto.Colors ?? dto.colors ?? null,
      cif: dto.Cif ?? dto.cif ?? "",
      sector: dto.Sector ?? dto.sector ?? "",
      direccionFiscal: dto.DireccionFiscal ?? dto.direccionFiscal ?? "",
    };
  }

  async update(
    input: UpdateCompanyInput,
    accessToken: string,
  ): Promise<void> {
    await this.client.request<unknown>("/Company/update", {
      method: "PUT",
      accessToken,
      body: {
        Nombre: input.Nombre,
        LogoUrl: input.LogoUrl,
        Colors: input.Colors,
        Cif: input.Cif,
        Sector: input.Sector,
        DireccionFiscal: input.DireccionFiscal,
      },
    });
  }

  async delete(
    input: DeleteCompanyInput,
    accessToken: string,
  ): Promise<void> {
    await this.client.request<unknown>("/Company/delete", {
      method: "DELETE",
      accessToken,
      body: { Password: input.Password },
    });
  }

  private toDomain(dto: CompanyDto): Company {
    return {
      id: dto.Id ?? dto.id ?? 0,
      nombre: dto.Nombre ?? dto.nombre ?? "",
      colors: dto.Colors ?? dto.colors ?? null,
      identificationId: dto.IdentificationId ?? dto.identificationId ?? null,
    };
  }
}
