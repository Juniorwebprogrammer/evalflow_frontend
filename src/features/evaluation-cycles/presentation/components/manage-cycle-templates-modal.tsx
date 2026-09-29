"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/shared/ui/modal";
import { Spinner } from "@/shared/ui/spinner";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, ClipboardIcon, DocIcon } from "@/shared/ui/icons";
import {
  useEvaluationCycles,
  EVALUATION_CYCLES_QUERY_KEY,
} from "@/features/evaluation-cycles/presentation/hooks/use-evaluation-cycles";
import {
  toggleTemplateInCycle,
  type EvaluationCycleResponse,
} from "@/features/evaluation-cycles/presentation/api/evaluation-cycle-client";
import { useTemplates } from "@/features/templates/presentation/hooks/use-templates";
import { errorMessage } from "@/shared/lib/api-error";
import { toggleId } from "@/shared/lib/query-cache";

/**
 * Lets an Owner/HR caller toggle which templates belong to an evaluation
 * cycle (backend
 * `PUT /evaluation-cycles/{cycleId}/templates/{templateId}/toggle`). Reads
 * the cycle's own `templateIds` from the evaluation-cycles query cache, so
 * it stays in sync as toggles are confirmed.
 */
export function ManageCycleTemplatesModal({
  cycleId,
  onClose,
}: {
  cycleId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: cycles } = useEvaluationCycles();
  const { data: templates, isLoading, error } = useTemplates();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const cycle = cycles?.find((c) => c.id === cycleId);

  async function handleToggle(templateId: number) {
    setPendingId(templateId);
    setToggleError(null);
    try {
      await toggleTemplateInCycle(cycleId, templateId);
      // The toggle endpoint just flips membership, so we can compute the new
      // state ourselves — more reliable than trusting a refetch's exact DTO
      // field names (which aren't guaranteed) to reflect it.
      queryClient.setQueryData<EvaluationCycleResponse[]>(EVALUATION_CYCLES_QUERY_KEY, (old) =>
        old?.map((c) =>
          c.id === cycleId ? { ...c, templateIds: toggleId(c.templateIds, templateId) } : c,
        ),
      );
    } catch (err) {
      setToggleError(
        errorMessage(err, "We couldn't update the cycle's templates.", {
          byDetail: [
            [
              "ya se ha completado",
              "This cycle has already been completed and can no longer be changed.",
            ],
            [
              "plantilla no existe",
              "This template no longer exists. Refresh the page and try again.",
            ],
          ],
        }),
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Modal
      onClose={onClose}
      title="Manage templates"
      description={cycle ? `Templates included in "${cycle.nombre}".` : undefined}
      icon={<ClipboardIcon className="h-5 w-5" />}
      size="lg"
    >
      {isLoading && <p className="text-sm text-slate-500">Loading templates…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {errorMessage(error, "We couldn't load the templates.")}
        </Notice>
      )}

      {templates && templates.length === 0 && (
        <p className="text-sm text-slate-500">No templates have been created yet.</p>
      )}

      {templates && templates.length > 0 && (
        <div className="max-h-96 space-y-1 overflow-y-auto">
          {templates.map((template) => {
            const checked = cycle?.templateIds.includes(template.id) ?? false;
            const pending = pendingId === template.id;
            return (
              <label
                key={template.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={pending}
                  onChange={() => handleToggle(template.id)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30 disabled:opacity-50"
                />
                {pending ? (
                  <Spinner className="h-4 w-4 text-[var(--brand)]" />
                ) : (
                  <DocIcon className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <span className="flex-1 truncate">{template.titulo}</span>
              </label>
            );
          })}
        </div>
      )}

      {toggleError && (
        <Notice tone="error" className="mt-4">
          {toggleError}
        </Notice>
      )}
    </Modal>
  );
}
