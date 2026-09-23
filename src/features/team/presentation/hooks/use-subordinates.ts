"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubordinates } from "@/features/team/presentation/api/team-client";

export function subordinatesQueryKey(userId: string) {
  return ["subordinates", userId] as const;
}

/** Reads a user's direct reports (backend `GET /team/{userId}/subordinates`). */
export function useSubordinates(userId: string) {
  return useQuery({
    queryKey: subordinatesQueryKey(userId),
    queryFn: () => getSubordinates(Number(userId)),
  });
}
