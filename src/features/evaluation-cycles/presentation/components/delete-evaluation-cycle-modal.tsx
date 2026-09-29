"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TrashIcon } from "@/shared/ui/icons";
import {
  deleteEvaluationCycle,
  type EvaluationCycleResponse,
} from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { EVALUATION_CYCLES_QUERY_KEY } from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import { errorMessage } from "@/shared/lib/api-error";
import { removeById } from "@/shared/lib/query-cache";

/** Confirms deleting an evaluation cycle. */
export function DeleteEvaluationCycleModal({
  cycle,
  onClose,
  onDeleted,
}: {
  cycle: EvaluationCycleResponse;
  onClose: () => void;
  /** Called after a successful delete, in addition to `onClose` — e.g. to navigate away from a detail page that no longer exists. */
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteEvaluationCycle(cycle.id);
      queryClient.setQueryData<EvaluationCycleResponse[]>(EVALUATION_CYCLES_QUERY_KEY, (old) =>
        removeById(old, cycle.id),
      );
      onClose();
      onDeleted?.();
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't delete the cycle.", {
          byDetail: [
            [
              "ciclo completado",
              "A completed cycle can't be deleted because it holds the evaluation results.",
            ],
            ["ciclo activo", "An active cycle can't be deleted. Deactivate it first."],
          ],
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Delete evaluation cycle"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <strong>{cycle.nombre}</strong>? This can&apos;t
        be undone.
      </p>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={handleConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
