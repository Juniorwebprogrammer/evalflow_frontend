"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/features/profile/domain/profile";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
} from "@/features/profile/presentation/api/profile-client";

export const PROFILE_QUERY_KEY = ["profile"] as const;

/**
 * Reads the current profile from the React Query cache. Seeded with
 * `initialData` fetched on the server so there is no loading flash, and kept
 * fresh by mutations (optimistic + revalidation).
 */
export function useProfile(initialData: Profile) {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    initialData,
  });
}

interface UpdateInput {
  nombre: string;
  apellidos: string;
}

/**
 * Updates the profile with an optimistic cache write: the UI reflects the new
 * name immediately, rolls back on error, and revalidates against the backend
 * when settled.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateInput) => updateProfile(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
      const previous = queryClient.getQueryData<Profile>(PROFILE_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Profile>(PROFILE_QUERY_KEY, {
          ...previous,
          nombre: input.nombre,
          apellidos: input.apellidos,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}

/** Mutation to change the current user's password. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      changePassword(input),
  });
}

/**
 * The signed-in user's role, from the `["profile"]` query (already seeded by
 * the dashboard shell, so it's available instantly). Preferred over
 * `Auth/my-features` for permission checks: that endpoint answers 404 — and
 * an empty role — when a role has no features configured.
 */
export function useMyRole() {
  const { data, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
  });
  return { role: data?.rol ?? "", isLoading };
}

/**
 * Uploads / removes the profile picture and writes the new `avatarUpdatedAt`
 * straight into the `["profile"]` cache, so every avatar (sidebar, top bar,
 * profile banner) switches to the new image at once.
 */
export function useAvatarMutations() {
  const queryClient = useQueryClient();

  function setAvatarVersion(avatarUpdatedAt: string | null) {
    queryClient.setQueryData<Profile>(PROFILE_QUERY_KEY, (previous) =>
      previous ? { ...previous, avatarUpdatedAt } : previous,
    );
  }

  const upload = useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    // Fall back to "now" if the backend didn't echo a timestamp — it only
    // has to change for the image URL to refresh.
    onSuccess: (avatarUpdatedAt) => setAvatarVersion(avatarUpdatedAt ?? new Date().toISOString()),
  });

  const remove = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => setAvatarVersion(null),
  });

  return { upload, remove };
}
