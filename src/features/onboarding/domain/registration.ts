/**
 * Registration entities — the owner onboarding flow. The owner is the person
 * signed in with Vexxen (name and email come from there) and the plan is the
 * one they chose in the Vexxen catalog; the form only asks for the company.
 * Maps to the backend `Onboarding/register-owner` contract (plus the Vexxen
 * access token, added on the server).
 */
export interface RegisterOwnerInput {
  CompanyNombre: string;
  CompanyColors: string;
  Sector: string;
  DireccionFiscal: string;
  Cif: string;
}

/** Mirrors backend `RegisterOwnerResponse`. */
export interface RegisterOwnerResult {
  message: string;
  userNombre: string;
  jwt: string;
  identificationId: string;
  planId: number;
  planStatus: string;
}
