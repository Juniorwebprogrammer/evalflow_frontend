/**
 * Company entity — the tenant/organization an evaluation cycle belongs to.
 * Mirrors the shape returned by the backend `Company/get/by-name/{name}` endpoint.
 */
export interface Company {
  id: number;
  nombre: string;
  /** Comma-separated or single hex color string used to brand the UI. */
  colors: string | null;
  identificationId: number | null;
}

/**
 * Company details as returned by `Company/get/by-identification/{id}`.
 * Includes the logo, which the by-name lookup does not.
 */
export interface CompanyInfo {
  nombre: string;
  logoUrl: string | null;
  colors: string | null;
  cif: string;
  sector: string;
  direccionFiscal: string;
}

/** Body for the backend `Company/update` endpoint. */
export interface UpdateCompanyInput {
  Nombre: string;
  LogoUrl: string;
  Colors: string;
  Cif: string;
  Sector: string;
  DireccionFiscal: string;
}

/** Body for the backend `Company/delete` endpoint. */
export interface DeleteCompanyInput {
  Password: string;
}

/** Parsed brand colors ready to be applied as CSS custom properties. */
export interface BrandColors {
  brand: string;
  brandStrong: string;
  brandSoft: string;
}
