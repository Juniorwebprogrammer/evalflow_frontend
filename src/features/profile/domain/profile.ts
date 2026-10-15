/**
 * Profile entities — the authenticated user's own profile (backend `Profile/me`).
 * Name, email, password and two-step verification belong to the Vexxen account:
 * they're edited in Vexxen and copied here on every sign-in.
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
  /** When the profile picture last changed (ISO), or null without one. Also its cache-buster. */
  avatarUpdatedAt: string | null;
}
