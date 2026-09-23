/**
 * Settings entities — account-level toggles that live outside the profile
 * itself. Mirrors the backend `Settings/2fa` contract.
 */
export interface Toggle2FAInput {
  UserId: number;
  Enable: boolean;
}

/** Mirrors the backend `Settings/2fa` response. */
export interface Toggle2FAResult {
  message: string;
}
