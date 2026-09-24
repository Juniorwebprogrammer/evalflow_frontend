"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createClarification,
  type ClarificationResponse,
  type CreateClarificationInput,
} from "@/features/clarifications/presentation/api/clarification-client";
import { cycleClarificationsQueryKey } from "@/features/clarifications/presentation/hooks/use-cycle-clarifications";
import { ApiError } from "@/shared/lib/api-error";

export function useCreateClarification(cycleId: number) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(input: CreateClarificationInput) {
    setIsSaving(true);
    setError(null);
    try {
      const created = await createClarification(cycleId, input);
      queryClient.setQueryData<ClarificationResponse[]>(
        cycleClarificationsQueryKey(cycleId),
        (old) => [created, ...(old ?? [])],
      );
      return created;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { create, isSaving, error, resetError: () => setError(null) };
}
