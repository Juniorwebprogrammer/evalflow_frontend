"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { TrashIcon } from "@/shared/ui/icons";
import {
  deleteQuestion,
  updateQuestion,
  type QuestionResponse,
} from "@/features/questions/presentation/api/question-client";
import { questionsQueryKey } from "@/features/questions/presentation/hooks/use-questions";
import { ApiError } from "@/shared/lib/api-error";
import { removeById } from "@/shared/lib/query-cache";

/** Confirms deleting a question. */
export function DeleteQuestionModal({
  templateId,
  question,
  onClose,
}: {
  templateId: number;
  question: QuestionResponse;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await deleteQuestion(templateId, question.id);

      const remaining = removeById(
        queryClient.getQueryData<QuestionResponse[]>(questionsQueryKey(templateId)),
        question.id,
      );

      if (remaining) {
        // Close the gap the deleted question's `orden` left, so the
        // remaining questions stay a clean 1..N sequence.
        const previousOrden = new Map(remaining.map((q) => [q.id, q.orden]));
        const renumbered = [...remaining]
          .sort((a, b) => a.orden - b.orden)
          .map((q, i) => ({ ...q, orden: i + 1 }));

        queryClient.setQueryData<QuestionResponse[]>(
          questionsQueryKey(templateId),
          renumbered,
        );

        const changed = renumbered.filter((q) => previousOrden.get(q.id) !== q.orden);
        await Promise.all(
          changed.map((q) =>
            updateQuestion(templateId, q.id, {
              texto: q.texto,
              tipo: q.tipo,
              topic: q.topic,
              opciones: q.opciones,
              orden: q.orden,
            }),
          ),
        );
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la pregunta. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Eliminar pregunta"
      icon={<TrashIcon className="h-5 w-5" />}
      disableClose={submitting}
    >
      <p className="text-sm text-slate-600">
        ¿Seguro que quieres eliminar <strong>&ldquo;{question.texto}&rdquo;</strong>?
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
