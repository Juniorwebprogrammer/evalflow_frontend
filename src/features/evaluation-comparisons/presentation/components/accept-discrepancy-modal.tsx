"use client";

import { useState } from "react";
import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { QuestionType } from "@/features/questions/domain/question";
import { useAcceptDiscrepancies } from "@/features/evaluation-comparisons/presentation/hooks/use-accept-discrepancies";
import type {
  AcceptedAnswerSource,
  QuestionComparisonResponse,
} from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";
import { formatScore } from "@/features/evaluation-comparisons/presentation/components/alignment-level";

export interface AcceptDiscrepancyTarget {
  evaluatedUserId: number;
  evaluatedUserName: string;
  managerName: string | null;
  templateId: number;
  templateTitle: string;
  questions: QuestionComparisonResponse[];
}

/**
 * Owner/RRHH accepts one or more imbalances, choosing which answer (the
 * manager's or the self-evaluation) becomes the final one in the result
 * and the PDF report.
 */
export function AcceptDiscrepancyModal({
  cycleId,
  target,
  onClose,
}: {
  cycleId: number;
  target: AcceptDiscrepancyTarget;
  onClose: () => void;
}) {
  const { accept, isSaving, error } = useAcceptDiscrepancies(cycleId);
  const [source, setSource] = useState<AcceptedAnswerSource>(initialSource(target.questions));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await accept({
        evaluatedUserId: target.evaluatedUserId,
        templateId: target.templateId,
        questionIds: target.questions.map((q) => q.questionId),
        source,
      });
      onClose();
    } catch {
      // Error is surfaced via `error` below.
    }
  }

  const single = target.questions.length === 1;

  return (
    <Modal
      onClose={onClose}
      title={single ? "Aceptar desequilibrio" : `Aceptar ${target.questions.length} desequilibrios`}
      description={`${target.evaluatedUserName} · ${target.templateTitle}`}
      icon={<CheckCircleIcon className="h-5 w-5" />}
      size="lg"
      disableClose={isSaving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {target.questions.map((question) => (
            <div key={question.questionId} className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm">
              <p className="font-medium text-slate-700">{question.texto}</p>
              <p className="mt-1 text-xs text-slate-500">
                Autoevaluación <strong className="text-slate-700">{answerLabel(question, "self")}</strong> ·
                Superior <strong className="text-slate-700">{answerLabel(question, "manager")}</strong>
              </p>
            </div>
          ))}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">
            ¿Qué respuesta queda como definitiva en el informe?
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SourceOption
              value="Superior"
              selected={source}
              onChange={setSource}
              title="Respuesta del superior"
              description={target.managerName ?? "Evaluador"}
              disabled={isSaving}
            />
            <SourceOption
              value="Autoevaluacion"
              selected={source}
              onChange={setSource}
              title="Autoevaluación"
              description={target.evaluatedUserName}
              disabled={isSaving}
            />
          </div>
        </fieldset>

        {error && (
          <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
            {error}
          </Notice>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving}>
            Aceptar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SourceOption({
  value,
  selected,
  onChange,
  title,
  description,
  disabled,
}: {
  value: AcceptedAnswerSource;
  selected: AcceptedAnswerSource;
  onChange: (value: AcceptedAnswerSource) => void;
  title: string;
  description: string;
  disabled: boolean;
}) {
  const active = value === selected;
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
        active ? "border-[var(--brand)] bg-[var(--brand)]/5" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <input
        type="radio"
        name="accepted-source"
        value={value}
        checked={active}
        onChange={() => onChange(value)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 text-[var(--brand)] focus:ring-[var(--brand)]/30"
      />
      <span>
        <span className="block font-semibold text-slate-800">{title}</span>
        <span className="block text-xs text-slate-500">{description}</span>
      </span>
    </label>
  );
}

function initialSource(questions: QuestionComparisonResponse[]): AcceptedAnswerSource {
  const sources = new Set(questions.map((q) => q.acceptedSource).filter(Boolean));
  return sources.size === 1 ? ([...sources][0] as AcceptedAnswerSource) : "Superior";
}

function answerLabel(question: QuestionComparisonResponse, who: "self" | "manager"): string {
  if (question.tipo === QuestionType.Seleccion) {
    const options = who === "self" ? question.selfOptions : question.managerOptions;
    return options && options.length > 0 ? options.join(", ") : "—";
  }
  return formatScore(who === "self" ? question.selfValue : question.managerValue);
}
