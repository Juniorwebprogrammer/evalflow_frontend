"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { completeEvaluationCycle } from "@/features/evaluation-results/presentation/api/evaluation-result-client";
import { cycleEvaluationResultsQueryKey } from "@/features/evaluation-results/presentation/hooks/use-evaluation-results";
import { cycleComparisonsQueryKey } from "@/features/evaluation-comparisons/presentation/hooks/use-cycle-comparisons";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { errorMessage } from "@/shared/lib/api-error";

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
        errorMessage(err, "We couldn't complete the evaluation.", {
          byDetail: [
            [
              "desequilibrios sin aceptar",
              "Some discrepancies haven't been accepted yet. Accept them before completing the evaluation.",
            ],
            ["no tiene formularios generados", "This cycle has no forms yet. Generate the forms before completing the evaluation."],
            ["ya se ha completado", "This evaluation cycle has already been completed."],
          ],
        }),
      );
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }

  return { complete, isCompleting, error, resetError: () => setError(null) };
}
