"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/features/profile/domain/profile";
import {
  fetchProfile,
  updateProfile,
  changePassword,
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
