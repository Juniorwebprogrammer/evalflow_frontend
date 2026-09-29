"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { generateSubmissions } from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { cycleSubmissionsQueryKey } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/features/evaluation-submissions/presentation/hooks/use-pending-submissions";
import { errorMessage } from "@/shared/lib/api-error";

/**
 * The backend replies with a (Spanish) sentence that includes how many forms
 * it generated — pull the count out of it so the success message can be
 * shown in English.
 */
function generatedMessage(raw: string): string {
  const match = raw.match(/\d+/);
  if (!match) return "Forms generated.";
  const count = Number(match[0]);
  if (count === 0) return "No new forms to generate — everyone assigned already has theirs.";
  return `${count} new ${count === 1 ? "form" : "forms"} generated.`;
}

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
      setMessage(generatedMessage(result.message));
      // Refresh the cycle's submission progress list, and the caller's own
      // pending list in case they're assigned to this cycle themselves.
      queryClient.invalidateQueries({ queryKey: cycleSubmissionsQueryKey(cycleId) });
      queryClient.invalidateQueries({ queryKey: PENDING_SUBMISSIONS_QUERY_KEY });
      return result;
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't generate the forms.", {
          byDetail: [["ya se ha completado", "This cycle has already been completed, so no more forms can be generated."]],
        }),
      );
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error, message };
}
