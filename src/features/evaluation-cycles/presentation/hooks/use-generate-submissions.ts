"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { generateSubmissions } from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { cycleSubmissionsQueryKey } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/features/evaluation-submissions/presentation/hooks/use-pending-submissions";
import { ApiError } from "@/shared/lib/api-error";

/** Triggers submission generation for a cycle's assigned users. */
export function useGenerateSubmissions(cycleId: number) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const result = await generateSubmissions(cycleId);
      setMessage(result.message);
      // Refresh the cycle's submission progress list, and the caller's own
      // pending list in case they're assigned to this cycle themselves.
      queryClient.invalidateQueries({ queryKey: cycleSubmissionsQueryKey(cycleId) });
      queryClient.invalidateQueries({ queryKey: PENDING_SUBMISSIONS_QUERY_KEY });
      return result;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron generar los formularios. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error, message };
}
