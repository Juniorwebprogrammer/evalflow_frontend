"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, MailIcon } from "@/shared/ui/icons";
import { useCreateClarification } from "@/features/clarifications/presentation/hooks/use-create-clarification";
import { TEXTAREA_CLASS } from "@/features/clarifications/presentation/components/clarification-status";
import { CLARIFICATION_MESSAGE_MAX_LENGTH } from "@/features/clarifications/domain/clarification";

export interface ClarificationTarget {
  evaluatedUserId: number;
  evaluatedUserName: string;
  managerName: string | null;
  templateId: number;
  templateTitle: string;
  question: { questionId: number; texto: string } | null;
}

/**
 * Lets Owner/RRHH ask the evaluated employee and their evaluator why they
 * answered what they answered. The backend emails both and the request shows
 * up in their "Solicitudes de información" page.
 */
export function RequestClarificationModal({
  cycleId,
  target,
  onClose,
}: {
  cycleId: number;
  target: ClarificationTarget;
  onClose: () => void;
}) {
  const { create, isSaving, error } = useCreateClarification(cycleId);
  const [mensaje, setMensaje] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({
        evaluatedUserId: target.evaluatedUserId,
        templateId: target.templateId,
        questionId: target.question?.questionId ?? null,
        mensaje,
      });
      onClose();
    } catch {
      // Error is surfaced via `error` below.
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Solicitar más información"
      description={`${target.evaluatedUserName} · ${target.templateTitle}`}
      icon={<MailIcon className="h-5 w-5" />}
      size="lg"
      disableClose={isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sobre</p>
          <p className="mt-0.5 font-medium text-slate-700">
            {target.question ? target.question.texto : "La evaluación completa"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Se enviará un email y una solicitud dentro de la app a{" "}
            <strong className="text-slate-700">{target.evaluatedUserName}</strong> (evaluado)
            {target.managerName && (
              <>
                {" "}y a <strong className="text-slate-700">{target.managerName}</strong> (evaluador)
              </>
            )}
            .
          </p>
        </div>

        <div>
          <label htmlFor="clarification-message" className="mb-1.5 block text-sm font-medium text-slate-700">
            ¿Qué necesitas saber?
          </label>
          <textarea
            id="clarification-message"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            maxLength={CLARIFICATION_MESSAGE_MAX_LENGTH}
            placeholder="Ej.: Hay una diferencia de 3 puntos en esta pregunta. ¿Podéis explicar en qué os basasteis para vuestra valoración?"
            className={TEXTAREA_CLASS}
            disabled={isSaving}
            required
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {mensaje.length}/{CLARIFICATION_MESSAGE_MAX_LENGTH}
          </p>
        </div>

        {error && (
          <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
            {error}
          </Notice>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving} disabled={!mensaje.trim()}>
            Enviar solicitud
          </Button>
        </div>
      </form>
    </Modal>
  );
}
