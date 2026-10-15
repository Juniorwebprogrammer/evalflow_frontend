/** Shared shapes for the onboarding wizard steps. */
export type OnboardingStep = "welcome" | "plan" | "company";

export interface CompanyData {
  CompanyNombre: string;
  CompanyColors: string;
  Sector: string;
  DireccionFiscal: string;
  Cif: string;
}
