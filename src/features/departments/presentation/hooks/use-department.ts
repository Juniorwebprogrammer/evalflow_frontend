"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDepartment } from "@/features/departments/presentation/api/department-client";

export function departmentQueryKey(id: number) {
  return ["department", id] as const;
}

/** Reads a single department (with its employee roster), backend `GET /departments/{id}`. */
export function useDepartment(id: number) {
  return useQuery({
    queryKey: departmentQueryKey(id),
    queryFn: () => fetchDepartment(id),
  });
}
