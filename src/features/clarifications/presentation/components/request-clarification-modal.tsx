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
  /** Pre-filled message, e.g. a question suggested by the AI analysis. */
  initialMessage?: string;
}

/**
 * Lets Owner/HR ask the evaluated employee and their evaluator why they
 * answered what they answered. The backend emails both and the request shows
 * up in their "Information requests" page.
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
  const [mensaje, setMensaje] = useState(target.initialMessage ?? "");

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
      title="Request more information"
      description={`${target.evaluatedUserName} · ${target.templateTitle}`}
      icon={<MailIcon className="h-5 w-5" />}
      size="lg"
      disableClose={isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">About</p>
          <p className="mt-0.5 font-medium text-slate-700">
            {target.question ? target.question.texto : "The entire evaluation"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            An email and an in-app request will be sent to{" "}
            <strong className="text-slate-700">{target.evaluatedUserName}</strong> (employee)
            {target.managerName && (
              <>
                {" "}and <strong className="text-slate-700">{target.managerName}</strong> (manager)
              </>
            )}
            .
          </p>
        </div>

        <div>
          <label htmlFor="clarification-message" className="mb-1.5 block text-sm font-medium text-slate-700">
            What do you need to know?
          </label>
          <textarea
            id="clarification-message"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            maxLength={CLARIFICATION_MESSAGE_MAX_LENGTH}
            placeholder="E.g. There is a 3-point difference on this question. Could you explain what you based your ratings on?"
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
            Cancel
          </Button>
          <Button type="submit" loading={isSaving} disabled={!mensaje.trim()}>
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
