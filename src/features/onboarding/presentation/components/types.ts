/** Shared shapes for the onboarding wizard steps. */
export type OnboardingStep =
  | "welcome"
  | "existing"
  | "account"
  | "company"
  | "verify-email";

export interface AccountData {
  UserNombre: string;
  Apellidos: string;
  Email: string;
  Password: string;
}

export interface CompanyData {
  CompanyNombre: string;
  CompanyColors: string;
  PlanId: number;
  Sector: string;
  DireccionFiscal: string;
  Cif: string;
}
