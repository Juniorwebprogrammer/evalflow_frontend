/**
 * Registration entities — input and output of the owner onboarding flow.
 * The request body maps 1:1 to the backend `Onboarding/register-owner` contract.
 */
export interface RegisterOwnerInput {
  UserNombre: string;
  Apellidos: string;
  Email: string;
  Password: string;
  CompanyNombre: string;
  CompanyColors: string;
  PlanId: number;
  Sector: string;
  DireccionFiscal: string;
  Cif: string;
}

/** Mirrors backend `RegisterOwnerResponse`. */
export interface RegisterOwnerResult {
  message: string;
  userNombre: string;
  jwt: string;
  refreshToken: string;
}
