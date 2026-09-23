"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TrashIcon } from "@/shared/ui/icons";
import {
  deleteTemplate,
  type TemplateResponse,
} from "@/features/templates/presentation/api/template-client";
import { TEMPLATES_QUERY_KEY } from "@/features/templates/presentation/hooks/use-templates";
import { templateQueryKey } from "@/features/templates/presentation/hooks/use-template";
import { ApiError } from "@/shared/lib/api-error";
import { removeById } from "@/shared/lib/query-cache";

/** Confirms deleting a template. */
export function DeleteTemplateModal({
  template,
  onClose,
}: {
  template: TemplateResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteTemplate(template.id);
      queryClient.setQueryData<TemplateResponse[]>(TEMPLATES_QUERY_KEY, (old) =>
        removeById(old, template.id),
      );
      queryClient.removeQueries({ queryKey: templateQueryKey(template.id) });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la plantilla. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Eliminar plantilla"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        ¿Seguro que quieres eliminar <strong>{template.titulo}</strong>? Esta
        acción no se puede deshacer.
      </p>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="button" variant="danger" loading={submitting} onClick={handleConfirm}>
          Eliminar
        </Button>
      </div>
    </Modal>
  );
}
