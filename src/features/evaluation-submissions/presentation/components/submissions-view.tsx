"use client";

import { useState } from "react";
import Link from "next/link";
import { usePendingSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-pending-submissions";
import { useCompletedSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-completed-submissions";
import type { PendingSubmissionResponse } from "@/features/evaluation-submissions/presentation/api/evaluation-submission-client";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, CalendarIcon, ClipboardIcon, DocIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

type Tab = "pending" | "completed";

/**
 * "Mis evaluaciones" — the caller's own pending/completed submissions
 * (backend `GET /evaluation-submissions/pending|completed`). A pending card
 * links to the form; a completed one doesn't, since there's no endpoint to
 * view previously saved answers.
 */
export function SubmissionsView() {
  const [tab, setTab] = useState<Tab>("pending");
  const pending = usePendingSubmissions();
  const completed = useCompletedSubmissions();

  const active = tab === "pending" ? pending : completed;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-slate-100">
        {(
          [
            { key: "pending", label: "Pendientes" },
            { key: "completed", label: "Completadas" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
              tab === key
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active.isLoading && (
        <p className="text-sm text-slate-500">Cargando formularios…</p>
      )}

      {active.error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {active.error instanceof ApiError
            ? active.error.message
            : "No se pudo cargar el listado de formularios."}
        </Notice>
      )}

      {active.data && active.data.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <ClipboardIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>
            {tab === "pending"
              ? "No tienes formularios pendientes por ahora."
              : "Todavía no has completado ningún formulario."}
          </span>
        </div>
      )}

      {active.data && active.data.length > 0 && (
        <div className="space-y-3">
          {active.data.map((submission) => (
            <SubmissionCard
              key={submission.submissionId}
              submission={submission}
              clickable={tab === "pending"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionCard({
  submission,
  clickable,
}: {
  submission: PendingSubmissionResponse;
  clickable: boolean;
}) {
  const content = (
    <section className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <DocIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">{submission.templateTitle}</h3>
            <p className="text-sm text-slate-500">
              {submission.cycleName} · Evaluado(a): {submission.evaluatedUserName}
            </p>
          </div>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
        <CalendarIcon className="h-4 w-4 text-slate-400" />
        Vence {formatDate(submission.fechaFinCiclo)}
      </span>
    </section>
  );

  if (!clickable) return content;

  return (
    <Link href={`/dashboard/mis-evaluaciones/${submission.submissionId}`}>{content}</Link>
  );
}
