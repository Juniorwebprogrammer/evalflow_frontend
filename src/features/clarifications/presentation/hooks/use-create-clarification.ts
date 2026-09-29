"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createClarification,
  type ClarificationResponse,
  type CreateClarificationInput,
} from "@/features/clarifications/presentation/api/clarification-client";
import { cycleClarificationsQueryKey } from "@/features/clarifications/presentation/hooks/use-cycle-clarifications";
import { errorMessage } from "@/shared/lib/api-error";

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
        errorMessage(err, "We couldn't send the information request.", {
          byDetail: [
            [
              "ya se ha completado",
              "This evaluation cycle has already been completed, so you can no longer request more information.",
            ],
            ["ciclos 360", "You can only request more information in 360° evaluation cycles."],
            [
              "deben estar completadas",
              "Both the self-assessment and the manager's evaluation must be completed before you can request more information.",
            ],
            ["no pertenece a la plantilla", "This question doesn't belong to the selected template."],
            ["no puede superar", "Your message is too long. Please shorten it and try again."],
            ["indica qué información", "Tell us what information you need."],
            // Our own route validation (application layer) rejects these first.
            ["cannot exceed", "Your message is too long. Please shorten it and try again."],
            ["what information you need", "Tell us what information you need."],
          ],
        }),
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { create, isSaving, error, resetError: () => setError(null) };
}
