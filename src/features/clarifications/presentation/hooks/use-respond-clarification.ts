"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  respondClarification,
  type MyClarificationResponse,
} from "@/features/clarifications/presentation/api/clarification-client";
import { MY_CLARIFICATIONS_QUERY_KEY } from "@/features/clarifications/presentation/hooks/use-my-clarifications";
import { ApiError } from "@/shared/lib/api-error";

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
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar la respuesta. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { respond, isSaving, error };
}
