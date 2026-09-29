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
      title={question ? "Edit question" : "New question"}
      description={
        question
          ? "Update the question's text, type, or options."
          : "Add a question to this template."
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
