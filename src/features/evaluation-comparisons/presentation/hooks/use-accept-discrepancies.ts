"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  acceptDiscrepancies,
  type AcceptDiscrepanciesInput,
} from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";
import { cycleComparisonsQueryKey } from "@/features/evaluation-comparisons/presentation/hooks/use-cycle-comparisons";
import { ApiError } from "@/shared/lib/api-error";

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
        err instanceof ApiError
          ? err.message
          : "No se pudo aceptar el desequilibrio. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { accept, isSaving, error };
}
