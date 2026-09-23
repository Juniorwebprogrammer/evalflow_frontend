import type { Company, CompanyInfo } from "@/features/company/domain/company";
import { ApiError, parseMessage } from "@/shared/lib/api-error";

/** Returns the company, or `null` when it does not exist (404). */
export async function fetchCompanyByName(name: string): Promise<Company | null> {
  const res = await fetch(`/api/company/${encodeURIComponent(name)}`, {
    method: "GET",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);

  const data = (await res.json()) as { company: Company };
  return data.company;
}

/** Fetches company details (incl. logo) by identificationId. */
export async function fetchCompanyByIdentificationId(
  identificationId: string,
): Promise<CompanyInfo> {
  const res = await fetch(
    `/api/company/by-identification/${encodeURIComponent(identificationId)}`,
    { method: "GET" },
  );

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);

  const data = (await res.json()) as { company: CompanyInfo };
  return data.company;
}

/** Updates the caller's company via our own route handler. */
export async function updateCompany(input: {
  nombre: string;
  logoUrl: string;
  colors: string;
  cif: string;
  sector: string;
  direccionFiscal: string;
}): Promise<void> {
  const res = await fetch("/api/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Nombre: input.nombre,
      LogoUrl: input.logoUrl,
      Colors: input.colors,
      Cif: input.cif,
      Sector: input.sector,
      DireccionFiscal: input.direccionFiscal,
    }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
}

/**
 * Permanently deletes the caller's company. On success the backend + our route
 * clear the session; the caller is responsible for wiping client state.
 */
export async function deleteCompany(input: {
  password: string;
}): Promise<void> {
  const res = await fetch("/api/company", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Password: input.password }),
  });

  if (!res.ok) throw new ApiError(await parseMessage(res), res.status);
}
