"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  saveSubmissionAnswers,
  type AnswerFormInput,
} from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";
import { PENDING_SUBMISSIONS_QUERY_KEY } from "@/features/evaluation-submissions/presentation/hooks/use-pending-submissions";
import { COMPLETED_SUBMISSIONS_QUERY_KEY } from "@/features/evaluation-submissions/presentation/hooks/use-completed-submissions";
import type { PendingSubmissionResponse } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";
import { ApiError } from "@/shared/lib/api-error";

/**
 * Submits every answer of a submission in one shot. On success, removes it
 * from the cached pending list (it's now completed) and invalidates the
 * completed list so it shows up there on next visit.
 */
export function useSaveSubmissionAnswers(submissionId: number) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(answers: AnswerFormInput[]) {
    setIsSaving(true);
    setError(null);
    try {
      const result = await saveSubmissionAnswers(submissionId, answers);

      queryClient.setQueryData<PendingSubmissionResponse[]>(
        PENDING_SUBMISSIONS_QUERY_KEY,
        (old) => old?.filter((s) => s.submissionId !== submissionId),
      );
      queryClient.invalidateQueries({ queryKey: COMPLETED_SUBMISSIONS_QUERY_KEY });

      return result;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron guardar las respuestas. Inténtalo de nuevo.",
      );
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return { save, isSaving, error };
}
