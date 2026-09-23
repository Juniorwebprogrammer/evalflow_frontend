"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmission } from "@/features/evaluation-submissions/presentation/hooks/use-submission";
import { useSaveSubmissionAnswers } from "@/features/evaluation-submissions/presentation/hooks/use-save-submission-answers";
import {
  QuestionAnswerField,
  isAnswered,
} from "@/features/evaluation-submissions/presentation/components/question-answer-field";
import { Notice } from "@/shared/ui/notice";
import { Button } from "@/shared/ui/button";
import { AlertTriangleIcon, ArrowRightIcon, CheckCircleIcon, DocIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { isPast } from "@/shared/lib/date";

/** Angles (in degrees) + stagger delays for the small confetti burst behind the checkmark. */
const CONFETTI = [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => ({
  angle,
  delay: i * 40,
}));

/** Celebratory success state shown right after a submission is saved (not on a later revisit — see the `done` vs `isCompleted` branches below). */
function SubmissionSuccessView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-100 bg-white px-8 py-20 text-center shadow-sm">
      <div className="success-badge relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
        {CONFETTI.map((c) => (
          <span
            key={c.angle}
            className="success-confetti absolute h-1.5 w-1.5 rounded-full bg-emerald-400"
            style={{ "--angle": `${c.angle}deg`, animationDelay: `${c.delay}ms` } as CSSProperties}
          />
        ))}
        <svg viewBox="0 0 36 36" className="h-14 w-14 text-emerald-500" fill="none">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            stroke="currentColor"
            strokeWidth="2.5"
            pathLength={1}
            strokeDasharray={1}
            className="success-ring"
          />
          <path
            d="M11 18.5 L15.5 23 L25 12.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            className="success-check"
          />
        </svg>
      </div>

      <div className="success-text space-y-1.5">
        <h2 className="text-xl font-bold text-slate-900">¡Formulario enviado!</h2>
        <p className="text-sm text-slate-500">Gracias por completar tu evaluación.</p>
      </div>

      <Link
        href="/dashboard/mis-evaluaciones"
        className="success-text inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
      >
        Volver a mis evaluaciones
      </Link>
    </div>
  );
}

/**
 * Fills out and submits one evaluation form (backend
 * `GET /evaluation-submissions/{id}` for the shell,
 * `PUT /evaluation-submissions/{id}/answers` to save). The backend requires
 * every question to be answered in a single call — there is no partial
 * save — so the submit button stays disabled until all of them have a value.
 */
export function SubmissionFormView({ submissionId }: { submissionId: number }) {
  const router = useRouter();
  const { data: submission, isLoading, error } = useSubmission(submissionId);
  const { save, isSaving, error: saveError } = useSaveSubmissionAnswers(submissionId);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);

  const allAnswered = useMemo(() => {
    if (!submission) return false;
    return submission.questions.every((q) =>
      isAnswered(q.tipo, answers[q.questionId] ?? ""),
    );
  }, [submission, answers]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando formulario…</p>;
  }

  if (error || !submission) {
    return (
      <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
        {error instanceof ApiError
          ? error.message
          : "No se pudo cargar el formulario."}
      </Notice>
    );
  }

  if (done) {
    return <SubmissionSuccessView />;
  }

  if (submission.isCompleted) {
    return (
      <div className="space-y-5">
        <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />}>
          Este formulario ya fue enviado. ¡Gracias!
        </Notice>
        <Link
          href="/dashboard/mis-evaluaciones"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          Volver a mis evaluaciones
        </Link>
      </div>
    );
  }

  // Blocked proactively: the cycle's deadline is gone before the user even
  // starts, so we never render an editable form for them to lose work in.
  // The backend also rejects the PUT after the deadline (defense in depth
  // for the race where the form was already open when it expired).
  if (isPast(submission.fechaFinCiclo)) {
    return (
      <div className="space-y-5">
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          El plazo para completar esta evaluación ha finalizado.
        </Notice>
        <Link
          href="/dashboard/mis-evaluaciones"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          Volver a mis evaluaciones
        </Link>
      </div>
    );
  }

  async function handleSubmit() {
    if (!submission) return;
    try {
      await save(
        submission.questions.map((q) => ({
          questionId: q.questionId,
          rawPayload: answers[q.questionId] ?? "",
        })),
      );
      setDone(true);
      router.refresh();
    } catch {
      // Error is surfaced via `saveError` below; nothing else to do here.
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/mis-evaluaciones"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver a mis evaluaciones
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <DocIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{submission.templateTitle}</h1>
            {submission.templateDescription && (
              <p className="mt-1 text-sm text-slate-500">{submission.templateDescription}</p>
            )}
            <p className="mt-2 text-sm text-slate-500">
              Ciclo <span className="font-medium text-slate-700">{submission.cycleName}</span>
              {" · "}
              Evaluado(a):{" "}
              <span className="font-medium text-slate-700">{submission.evaluatedUserName}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {submission.questions.map((question, index) => (
          <section
            key={question.questionId}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-900">
              {index + 1}. {question.texto}
            </p>
            <div className="mt-3">
              <QuestionAnswerField
                question={question}
                value={answers[question.questionId] ?? ""}
                onChange={(rawPayload) =>
                  setAnswers((prev) => ({ ...prev, [question.questionId]: rawPayload }))
                }
              />
            </div>
          </section>
        ))}
      </div>

      {saveError && <Notice tone="error">{saveError}</Notice>}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!allAnswered}
          loading={isSaving}
          onClick={handleSubmit}
        >
          Enviar respuestas
        </Button>
      </div>
    </div>
  );
}
