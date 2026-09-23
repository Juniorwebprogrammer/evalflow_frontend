"use client";

import { useQuery } from "@tanstack/react-query";
import { listDepartments } from "@/features/departments/presentation/api/department-client";

export const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

/** Reads the caller's company department list (backend `GET /departments`). */
export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: listDepartments,
  });
}
