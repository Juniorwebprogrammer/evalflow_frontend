import type {
  Profile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/features/profile/domain/profile";

/** Port for the authenticated user's profile. Implemented by infrastructure. */
export interface ProfileRepository {
  /** Returns the profile of the caller identified by `accessToken` (JWT). */
  getMe(accessToken: string): Promise<Profile>;
  /** Updates the caller's editable fields. */
  update(input: UpdateProfileInput, accessToken: string): Promise<void>;
  /** Changes the caller's password. */
  changePassword(
    input: ChangePasswordInput,
    accessToken: string,
  ): Promise<void>;
}
