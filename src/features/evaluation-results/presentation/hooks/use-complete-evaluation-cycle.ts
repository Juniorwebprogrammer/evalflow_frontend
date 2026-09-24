"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { completeEvaluationCycle } from "@/features/evaluation-results/presentation/api/evaluation-result-client";
import { cycleEvaluationResultsQueryKey } from "@/features/evaluation-results/presentation/hooks/use-evaluation-results";
import { cycleComparisonsQueryKey } from "@/features/evaluation-comparisons/presentation/hooks/use-cycle-comparisons";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { ApiError } from "@/shared/lib/api-error";

export function useCompleteEvaluationCycle(cycleId: number) {
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    setIsCompleting(true);
    setError(null);
    try {
      const result = await completeEvaluationCycle(cycleId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: EVALUATION_CYCLES_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: cycleComparisonsQueryKey(cycleId) }),
        queryClient.invalidateQueries({ queryKey: cycleEvaluationResultsQueryKey(cycleId) }),
      ]);
      return result;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo completar la evaluación. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }

  return { complete, isCompleting, error, resetError: () => setError(null) };
}
