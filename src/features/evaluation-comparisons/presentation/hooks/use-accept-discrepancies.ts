"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  acceptDiscrepancies,
  type AcceptDiscrepanciesInput,
} from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";
import { cycleComparisonsQueryKey } from "@/features/evaluation-comparisons/presentation/hooks/use-cycle-comparisons";
import { errorMessage } from "@/shared/lib/api-error";

export function useAcceptDiscrepancies(cycleId: number) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept(input: AcceptDiscrepanciesInput) {
    setIsSaving(true);
    setError(null);
    try {
      const result = await acceptDiscrepancies(cycleId, input);
      await queryClient.invalidateQueries({ queryKey: cycleComparisonsQueryKey(cycleId) });
      return result;
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't accept the imbalance.", {
          byDetail: [
            [
              "ya se ha completado",
              "This cycle has already been completed and can no longer be changed.",
            ],
            [
              "deben estar completadas",
              "Both the self-assessment and the manager's evaluation must be completed before you can accept an imbalance.",
            ],
            ["ciclos 360", "Imbalances can only be accepted in 360° cycles."],
            [
              "no pertenece a la plantilla",
              "Some of these questions are no longer part of the template. Refresh the page and try again.",
            ],
          ],
        }),
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { accept, isSaving, error };
}
