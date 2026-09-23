"use client";

import { useQuery } from "@tanstack/react-query";
import { listTemplates } from "@/features/templates/presentation/api/template-client";

export const TEMPLATES_QUERY_KEY = ["templates"] as const;

/** Reads the caller's company template list (backend `GET /templates`). */
export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: listTemplates,
  });
}
