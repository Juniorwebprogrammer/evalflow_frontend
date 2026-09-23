"use client";

import { Modal } from "@/shared/ui/modal";
import { ClipboardIcon } from "@/shared/ui/icons";
import { EvaluationCycleForm } from "@/features/evaluation-cycles/presentation/components/evaluation-cycle-form";
import type { EvaluationCycleResponse } from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";

/** Modal wrapper around {@link EvaluationCycleForm}. Edits when `cycle` is given, creates otherwise. */
export function EvaluationCycleFormModal({
  cycle,
  onClose,
}: {
  cycle?: EvaluationCycleResponse;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={cycle ? "Editar ciclo de evaluación" : "Nuevo ciclo de evaluación"}
      description={
        cycle
          ? "Actualiza los datos del ciclo."
          : "Crea un ciclo de evaluación para tu empresa."
      }
      icon={<ClipboardIcon className="h-5 w-5" />}
      size="lg"
    >
      <EvaluationCycleForm cycle={cycle} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
