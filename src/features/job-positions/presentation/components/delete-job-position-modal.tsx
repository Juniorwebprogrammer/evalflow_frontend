"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TrashIcon } from "@/shared/ui/icons";
import {
  deleteJobPosition,
  type JobPositionSummaryResponse,
} from "@/features/job-positions/presentation/api/job-position-client";
import { JOB_POSITIONS_QUERY_KEY } from "@/features/job-positions/presentation/hooks/use-job-positions";
import { EMPLOYEES_QUERY_KEY } from "@/features/team/presentation/hooks/use-employees";
import { errorMessage } from "@/shared/lib/api-error";

/** Confirms deleting a job position. Employees holding it are left without one on the backend. */
export function DeleteJobPositionModal({
  position,
  onClose,
}: {
  position: JobPositionSummaryResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteJobPosition(position.id);
      queryClient.invalidateQueries({ queryKey: JOB_POSITIONS_QUERY_KEY });
      // Employees holding this position are left without one on the backend.
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "We couldn't delete the job position."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Delete job position"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        Are you sure you want to delete <strong>{position.nombre}</strong>?{" "}
        {position.employeeCount > 0 &&
          (position.employeeCount === 1
            ? "The employee who holds it will be left without a job position."
            : `The ${position.employeeCount} employees who hold it will be left without a job position.`)}
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
