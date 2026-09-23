import type {
  Toggle2FAInput,
  Toggle2FAResult,
} from "@/features/settings/domain/settings";

/** Port for account-level settings. Implemented by the infrastructure layer. */
export interface SettingsRepository {
  /**
   * Enables/disables 2FA for the given user. `UserId` travels in the body
   * (the backend does not derive it from the bearer token's claims), so the
   * caller must resolve it themselves — see `readUserIdFromJwt`.
   */
  toggle2FA(input: Toggle2FAInput, accessToken: string): Promise<Toggle2FAResult>;
}
