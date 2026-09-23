/**
 * Profile entities — the authenticated user's own profile.
 * Mirrors the backend `Profile/me` and `Profile/update` contracts.
 */
export interface Profile {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  /** ISO date string of when the account was created (backend FechaCreacion). */
  fechaCreacion: string;
  nombreEmpresa: string;
  /** Company identifier — used to fetch/update the organization. */
  identificationId: string;
  /** Company attributes returned alongside the profile. */
  sector: string;
  planId: number;
  direccionFiscal: string;
  cif: string;
  /** Whether 2FA login is enabled (backend `TwoFactorAuthentication`). */
  twoFactorEnabled: boolean;
}

/** Fields the backend `Profile/update` endpoint accepts. */
export interface UpdateProfileInput {
  Nombre: string;
  Apellidos: string;
}

/** Body for the backend `Profile/change-password` endpoint. */
export interface ChangePasswordInput {
  CurrentPassword: string;
  NewPassword: string;
}
