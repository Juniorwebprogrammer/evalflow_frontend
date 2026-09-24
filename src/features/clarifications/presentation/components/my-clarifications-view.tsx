"use client";

import { useState } from "react";
import { useMyClarifications } from "@/features/clarifications/presentation/hooks/use-my-clarifications";
import { useRespondClarification } from "@/features/clarifications/presentation/hooks/use-respond-clarification";
import type { MyClarificationResponse } from "@/features/clarifications/presentation/api/clarification-client";
import { TEXTAREA_CLASS } from "@/features/clarifications/presentation/components/clarification-status";
import { CLARIFICATION_RESPONSE_MAX_LENGTH } from "@/features/clarifications/domain/clarification";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, CheckCircleIcon, ClipboardIcon, MailIcon } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

type Tab = "pending" | "answered";

/**
 * "Solicitudes de información" — requests from RRHH asking the caller to
 * explain an evaluation they gave (as evaluator) or received (as evaluated).
 * Each one can be answered once, right here.
 */
export function MyClarificationsView() {
  const [tab, setTab] = useState<Tab>("pending");
  const { data, isLoading, error } = useMyClarifications();

  const pending = (data ?? []).filter((c) => !c.myRespondedAt);
  const answered = (data ?? []).filter((c) => c.myRespondedAt);
  const visible = tab === "pending" ? pending : answered;

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-slate-100">
        {(
          [
            { key: "pending", label: "Pendientes", count: pending.length },
            { key: "answered", label: "Respondidas", count: answered.length },
          ] as const
        ).map(({ key, label, count }) => (
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
            {data && ` (${count})`}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando solicitudes…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error instanceof ApiError ? error.message : "No se pudieron cargar las solicitudes."}
        </Notice>
      )}

      {data && visible.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <ClipboardIcon className="h-5 w-5 shrink-0 text-slate-400" />
          <span>
            {tab === "pending"
              ? "No tienes solicitudes de información pendientes."
              : "Todavía no has respondido ninguna solicitud."}
          </span>
        </div>
      )}

      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((clarification) => (
            <ClarificationCard key={clarification.id} clarification={clarification} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClarificationCard({ clarification }: { clarification: MyClarificationResponse }) {
  const isEvaluated = clarification.myRole === "Evaluado";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <MailIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">{clarification.templateTitle}</h3>
            <p className="text-sm text-slate-500">
              {clarification.cycleName} ·{" "}
              {isEvaluated
                ? "Sobre tu autoevaluación"
                : `Sobre tu evaluación de ${clarification.evaluatedUserName}`}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          {clarification.requestedByName} · {formatDate(clarification.fechaCreacion)}
        </span>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pregunta</p>
        <p className="mt-0.5 font-medium text-slate-700">
          {clarification.questionText ?? "La evaluación completa"}
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Mensaje de RRHH
        </p>
        <p className="mt-0.5 whitespace-pre-line text-slate-700">{clarification.mensaje}</p>
      </div>

      {clarification.myRespondedAt ? (
        <div className="mt-4 text-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Respondiste el {formatDate(clarification.myRespondedAt)}
          </p>
          <p className="mt-1 whitespace-pre-line text-slate-700">{clarification.myResponse ?? "—"}</p>
        </div>
      ) : (
        <ResponseForm clarificationId={clarification.id} />
      )}
    </section>
  );
}

function ResponseForm({ clarificationId }: { clarificationId: number }) {
  const { respond, isSaving, error } = useRespondClarification(clarificationId);
  const [respuesta, setRespuesta] = useState("");
  const textareaId = `clarification-response-${clarificationId}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await respond(respuesta);
    } catch {
      // Error is surfaced via `error` below.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
          Tu explicación
        </label>
        <textarea
          id={textareaId}
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={4}
          maxLength={CLARIFICATION_RESPONSE_MAX_LENGTH}
          placeholder="Explica en qué te basaste para responder lo que respondiste."
          className={TEXTAREA_CLASS}
          disabled={isSaving}
          required
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Solo podrás enviarla una vez. Solo RRHH podrá leerla.</span>
          <span>
            {respuesta.length}/{CLARIFICATION_RESPONSE_MAX_LENGTH}
          </span>
        </div>
      </div>

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error}
        </Notice>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={isSaving} disabled={!respuesta.trim()}>
          Enviar respuesta
        </Button>
      </div>
    </form>
  );
}
