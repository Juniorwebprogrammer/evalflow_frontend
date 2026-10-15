import type { BackendFile } from "@/core/http/backend-client";
import type { Profile } from "@/features/profile/domain/profile";

/** Port for the authenticated user's profile. Implemented by infrastructure. */
export interface ProfileRepository {
  /** Returns the profile of the caller identified by `accessToken` (JWT). */
  getMe(accessToken: string): Promise<Profile>;
  /** Replaces the caller's profile picture (base64 image); returns its new timestamp. */
  uploadAvatar(data: string, accessToken: string): Promise<string | null>;
  /** Removes the caller's profile picture (no-op when there is none). */
  deleteAvatar(accessToken: string): Promise<void>;
  /** Downloads the caller's profile picture. Throws `NotFoundError` without one. */
  getAvatar(accessToken: string): Promise<BackendFile>;
}
