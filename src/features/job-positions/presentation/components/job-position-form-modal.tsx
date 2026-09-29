"use client";

import { Modal } from "@/shared/ui/modal";
import { BriefcaseIcon } from "@/shared/ui/icons";
import { JobPositionForm } from "@/features/job-positions/presentation/components/job-position-form";
import type { JobPositionSummaryResponse } from "@/features/job-positions/presentation/api/job-position-client";

/** Modal wrapper around {@link JobPositionForm}. Edits when `position` is given, creates otherwise. */
export function JobPositionFormModal({
  position,
  onClose,
}: {
  position?: JobPositionSummaryResponse;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={position ? "Edit job position" : "New job position"}
      description={
        position
          ? "Update the name or description of this job position."
          : "Create a job position to assign to your employees."
      }
      icon={<BriefcaseIcon className="h-5 w-5" />}
    >
      <JobPositionForm position={position} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
