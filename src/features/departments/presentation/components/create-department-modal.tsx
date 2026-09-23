"use client";

import { Modal } from "@/shared/ui/modal";
import { BuildingIcon } from "@/shared/ui/icons";
import { CreateDepartmentForm } from "@/features/departments/presentation/components/create-department-form";

/** Modal wrapper around {@link CreateDepartmentForm}. */
export function CreateDepartmentModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      onClose={onClose}
      title="Nuevo departamento"
      description="Crea un departamento para organizar tu empresa."
      icon={<BuildingIcon className="h-5 w-5" />}
    >
      <CreateDepartmentForm onCreated={onClose} onCancel={onClose} />
    </Modal>
  );
}
