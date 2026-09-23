"use client";

import { Modal } from "@/shared/ui/modal";
import { ListIcon } from "@/shared/ui/icons";
import { QuestionForm } from "@/features/questions/presentation/components/question-form";
import type { QuestionResponse } from "@/features/questions/presentation/api/question-client";

/** Modal wrapper around {@link QuestionForm}. Edits when `question` is given, creates otherwise. */
export function QuestionFormModal({
  templateId,
  question,
  nextOrden,
  onClose,
}: {
  templateId: number;
  question?: QuestionResponse;
  nextOrden?: number;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={question ? "Editar pregunta" : "Nueva pregunta"}
      description={
        question
          ? "Actualiza el texto, tipo u opciones de la pregunta."
          : "Añade una pregunta a esta plantilla."
      }
      icon={<ListIcon className="h-5 w-5" />}
      size="lg"
    >
      <QuestionForm
        templateId={templateId}
        question={question}
        nextOrden={nextOrden}
        onSaved={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}
