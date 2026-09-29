"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCycleAiAnalyses,
  requestAiAnalysis,
} from "@/features/ai-analysis/presentation/api/ai-analysis-client";
import {
  isAiAnalysisInProgress,
  type RequestAiAnalysisInput,
} from "@/features/ai-analysis/domain/ai-analysis";
import { useCompanyPlan } from "@/features/plans/presentation/hooks/use-plans";
import { errorMessage } from "@/shared/lib/api-error";

/** Polling fallback while an analysis runs, in case the realtime event is missed. */
const IN_PROGRESS_POLL_MS = 10_000;

export function cycleAiAnalysesQueryKey(cycleId: number) {
  return ["ai-analyses", cycleId] as const;
}

/** Whether the company's plan includes AI (Growth / Enterprise). `undefined` while loading. */
export function useHasAiFeatures(): boolean | undefined {
  const { data } = useCompanyPlan();
  return data?.plan.hasAiFeatures;
}

export function useCycleAiAnalyses(cycleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cycleAiAnalysesQueryKey(cycleId),
    queryFn: () => fetchCycleAiAnalyses(cycleId),
    staleTime: 0,
    refetchOnMount: "always",
    enabled: options?.enabled ?? true,
    refetchInterval: (query) =>
      query.state.data?.some(isAiAnalysisInProgress) ? IN_PROGRESS_POLL_MS : false,
  });
}

export function useRequestAiAnalysis(cycleId: number) {
  const queryClient = useQueryClient();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** `key` identifies what was requested (e.g. an employee card) so only its button shows a spinner. */
  async function request(input: RequestAiAnalysisInput, key = "cycle") {
    setPendingKey(key);
    setError(null);
    try {
      const result = await requestAiAnalysis(cycleId, input);
      await queryClient.invalidateQueries({ queryKey: cycleAiAnalysesQueryKey(cycleId) });
      return result;
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't request the AI analysis.", {
          byDetail: [
            [
              "planes growth",
              "AI analysis is available on the Growth and Enterprise plans. Upgrade your plan to use it.",
            ],
            [
              "al mes",
              "You've reached your plan's monthly limit of AI analyses. Upgrade your plan or try again next month.",
            ],
            [
              "en este momento",
              "AI analysis isn't available right now. Please try again later.",
            ],
            [
              "no hay evaluaciones completadas",
              "There are no completed evaluations to analyze yet.",
            ],
          ],
          byStatus: {
            429: "You've requested too many analyses in a short time. Please wait a moment and try again.",
            503: "AI analysis isn't available right now. Please try again later.",
          },
        }),
      );
      throw err;
    } finally {
      setPendingKey(null);
    }
  }

  return { request, pendingKey, error, clearError: () => setError(null) };
}
