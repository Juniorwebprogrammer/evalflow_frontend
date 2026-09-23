"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/features/profile/domain/profile";
import { PROFILE_QUERY_KEY } from "@/features/profile/presentation/hooks/use-profile";
import { toggle2FA } from "@/features/settings/presentation/api/settings-client";

/**
 * Enables/disables 2FA with an optimistic write to the cached profile (the
 * same cache the profile screen reads `twoFactorEnabled` from), rolling back
 * on error and revalidating against the backend when settled.
 */
export function useToggle2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enable: boolean) => toggle2FA(enable),
    onMutate: async (enable) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });
      const previous = queryClient.getQueryData<Profile>(PROFILE_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Profile>(PROFILE_QUERY_KEY, {
          ...previous,
          twoFactorEnabled: enable,
        });
      }
      return { previous };
    },
    onError: (_error, _enable, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
