"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  deleteSubmission,
  type CycleSubmissionResponse,
} from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";
import { cycleSubmissionsQueryKey } from "@/features/evaluation-submissions/presentation/hooks/use-cycle-submissions";
import { errorMessage } from "@/shared/lib/api-error";

/** Deletes a submission (Owner/Rrhh only) and removes it from the cycle's cached progress list. */
export function useDeleteSubmission(cycleId: number) {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(submissionId: number) {
    setPendingId(submissionId);
    setError(null);
    try {
      const result = await deleteSubmission(submissionId);
      queryClient.setQueryData<CycleSubmissionResponse[]>(
        cycleSubmissionsQueryKey(cycleId),
        (old) => old?.filter((s) => s.submissionId !== submissionId),
      );
      return result;
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't delete the form.", {
          byDetail: [
            [
              "ya se ha completado",
              "This cycle has already been completed, so its forms can no longer be deleted.",
            ],
          ],
        }),
      );
      throw err;
    } finally {
      setPendingId(null);
    }
  }

  return { remove, pendingId, error };
}
