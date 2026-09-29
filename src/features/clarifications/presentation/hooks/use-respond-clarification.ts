"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  respondClarification,
  type MyClarificationResponse,
} from "@/features/clarifications/presentation/api/clarification-client";
import { MY_CLARIFICATIONS_QUERY_KEY } from "@/features/clarifications/presentation/hooks/use-my-clarifications";
import { errorMessage } from "@/shared/lib/api-error";

export function useRespondClarification(clarificationId: number) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function respond(respuesta: string) {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await respondClarification(clarificationId, respuesta);
      queryClient.setQueryData<MyClarificationResponse[]>(
        MY_CLARIFICATIONS_QUERY_KEY,
        (old) => old?.map((c) => (c.id === clarificationId ? updated : c)),
      );
      return updated;
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't send your response.", {
          byDetail: [
            ["ya has respondido", "You've already responded to this request."],
            ["no puede superar", "Your response is too long. Please shorten it and try again."],
            ["no puede estar vacía", "Please write a response before sending it."],
            // Our own route validation (application layer) rejects these first.
            ["cannot exceed", "Your response is too long. Please shorten it and try again."],
            ["cannot be empty", "Please write a response before sending it."],
          ],
          byStatus: {
            404: "We couldn't find this information request. It may have been removed.",
          },
        }),
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { respond, isSaving, error };
}
