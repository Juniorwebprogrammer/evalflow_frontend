"use client";

import { Modal } from "@/shared/ui/modal";
import { DocIcon } from "@/shared/ui/icons";
import { TemplateForm } from "@/features/templates/presentation/components/template-form";
import type { TemplateResponse } from "@/features/templates/presentation/api/template-client";

/** Modal wrapper around {@link TemplateForm}. Edits when `template` is given, creates otherwise. */
export function TemplateFormModal({
  template,
  onClose,
}: {
  template?: TemplateResponse;
  onClose: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title={template ? "Edit template" : "New template"}
      description={
        template
          ? "Update the template details."
          : "Create an evaluation template for your company."
      }
      icon={<DocIcon className="h-5 w-5" />}
      size="lg"
    >
      <TemplateForm template={template} onSaved={onClose} onCancel={onClose} />
    </Modal>
  );
}
