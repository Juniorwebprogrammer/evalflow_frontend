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
      title={position ? "Editar cargo" : "Nuevo cargo"}
      description={
        position
          ? "Actualiza el nombre o la descripción de este cargo."
          : "Crea un cargo para asignarlo a tus empleados."
      }
      icon={<BriefcaseIcon className="h-5 w-5" />}
    >
      <JobPositionForm position={position} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
