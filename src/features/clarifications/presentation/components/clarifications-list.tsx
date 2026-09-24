"use client";

import type { ClarificationResponse } from "@/features/clarifications/presentation/api/clarification-client";
import {
  clarificationStatusClass,
  clarificationStatusLabel,
} from "@/features/clarifications/presentation/components/clarification-status";
import { formatDate } from "@/shared/lib/format-date";

/** Owner/RRHH view of the clarification requests of one employee comparison, with both answers. */
export function ClarificationsList({ clarifications }: { clarifications: ClarificationResponse[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Solicitudes de información
      </h3>
      <div className="mt-2 space-y-2">
        {clarifications.map((clarification) => (
          <div
            key={clarification.id}
            className="rounded-lg border border-slate-100 bg-white px-3.5 py-3 text-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">
                  {clarification.questionText ?? "Evaluación completa"}
                </p>
                <p className="text-xs text-slate-400">
                  {clarification.requestedByName} · {formatDate(clarification.fechaCreacion)}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${clarificationStatusClass(clarification.estado)}`}
              >
                {clarificationStatusLabel(clarification.estado)}
              </span>
            </div>

            <p className="mt-2 whitespace-pre-line text-slate-600">{clarification.mensaje}</p>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <ParticipantAnswer
                label={`Evaluado · ${clarification.evaluatedUserName}`}
                response={clarification.evaluatedResponse}
                respondedAt={clarification.evaluatedRespondedAt}
              />
              <ParticipantAnswer
                label={`Evaluador · ${clarification.managerName}`}
                response={clarification.managerResponse}
                respondedAt={clarification.managerRespondedAt}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParticipantAnswer({
  label,
  response,
  respondedAt,
}: {
  label: string;
  response: string | null;
  respondedAt: string | null;
}) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-2">
      <p className="font-semibold text-slate-500">{label}</p>
      {respondedAt ? (
        <>
          <p className="mt-0.5 whitespace-pre-line text-slate-700">{response ?? "—"}</p>
          <p className="mt-1 text-slate-400">{formatDate(respondedAt)}</p>
        </>
      ) : (
        <p className="mt-0.5 italic text-slate-400">Pendiente de respuesta</p>
      )}
    </div>
  );
}
