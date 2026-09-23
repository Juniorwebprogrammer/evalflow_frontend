"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTemplate } from "@/features/templates/presentation/api/template-client";

export function templateQueryKey(id: number) {
  return ["template", id] as const;
}

/** Reads a single template, backend `GET /templates/{id}`. */
export function useTemplate(id: number) {
  return useQuery({
    queryKey: templateQueryKey(id),
    queryFn: () => fetchTemplate(id),
  });
}
