"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCompanyPlan, fetchPlans } from "@/features/plans/presentation/api/plan-client";
import { useMyRole } from "@/features/profile/presentation/hooks/use-profile";
import { isPrivilegedRole } from "@/shared/lib/roles";

export const PLANS_QUERY_KEY = ["plans"] as const;
export const COMPANY_PLAN_QUERY_KEY = ["company-plan"] as const;

/** Lists whose changes move plan usage — any update to them refreshes it. */
const USAGE_SOURCES = new Set(["employees", "departments", "templates", "evaluation-cycles", "ai-analyses"]);

/** The plans on sale (sign-up plan picker). */
export function usePlans() {
  return useQuery({
    queryKey: PLANS_QUERY_KEY,
    queryFn: fetchPlans,
    staleTime: 5 * 60_000,
  });
}

/**
 * The caller's company plan and usage (Owner/Rrhh only — disabled for other
 * roles). Refreshes itself whenever the employees, departments, templates or
 * cycles lists change in the cache, so "at limit" states follow every
 * create / delete / (de)activation without each form having to remember.
 */
export function useCompanyPlan() {
  const queryClient = useQueryClient();
  const { role } = useMyRole();
  const enabled = isPrivilegedRole(role);

  useEffect(() => {
    if (!enabled) return;
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "success") return;
      const root = event.query.queryKey[0];
      if (typeof root === "string" && USAGE_SOURCES.has(root)) {
        queryClient.invalidateQueries({ queryKey: COMPANY_PLAN_QUERY_KEY });
      }
    });
  }, [enabled, queryClient]);

  return useQuery({
    queryKey: COMPANY_PLAN_QUERY_KEY,
    queryFn: fetchCompanyPlan,
    enabled,
    staleTime: 0,
  });
}
