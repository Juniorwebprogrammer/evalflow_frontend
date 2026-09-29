"use client";

import type {
  AiAnalysis,
  AiConfidence,
  AiRecipient,
  AiRiskLevel,
} from "@/features/ai-analysis/domain/ai-analysis";
import { isAiAnalysisInProgress } from "@/features/ai-analysis/domain/ai-analysis";
import { formatDate } from "@/shared/lib/format-date";
import { Spinner } from "@/shared/ui/spinner";
import { AlertTriangleIcon, CrownIcon, MailIcon, SparkleIcon } from "@/shared/ui/icons";

const RISK_CLASS: Record<AiRiskLevel, string> = {
  Bajo: "bg-emerald-50 text-emerald-700",
  Medio: "bg-amber-50 text-amber-700",
  Alto: "bg-red-50 text-red-600",
};

const CONFIDENCE_CLASS: Record<AiConfidence, string> = {
  Alta: "text-emerald-600",
  Media: "text-amber-600",
  Baja: "text-slate-400",
};

const RECIPIENT_LABEL: Record<AiRecipient, string> = {
  RRHH: "RRHH",
  Evaluado: "Evaluado",
  Evaluador: "Evaluador",
};

/**
 * "Análisis con IA" block of an employee's comparison card: explains the
 * imbalances (360) or strengths / areas to improve (Auto, 180) from the
 * answers and the information requests. Growth / Enterprise only.
 */
export function AiAnalysisPanel({
  analysis,
  hasAiFeatures,
  canAnalyse,
  isRequesting,
  questionTexts,
  canRequestClarification,
  onAnalyse,
  onSuggestedClarification,
}: {
  analysis: AiAnalysis | undefined;
  /** `undefined` while the plan loads. */
  hasAiFeatures: boolean | undefined;
  /** Whether the employee has completed answers to analyse. */
  canAnalyse: boolean;
  isRequesting: boolean;
  questionTexts: Map<number, string>;
  canRequestClarification: boolean;
  onAnalyse: (force: boolean) => void;
  onSuggestedClarification: (questionId: number | null, mensaje: string) => void;
}) {
  if (hasAiFeatures === undefined) return null;

  const inProgress = analysis ? isAiAnalysisInProgress(analysis) : false;
  const result = analysis?.estado === "Completado" ? analysis.result : null;

  return (
    <section className="rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50/60 to-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Análisis con IA</h3>
            <p className="text-xs text-slate-500">
              {result && analysis?.fechaCompletado
                ? `Generado el ${formatDate(analysis.fechaCompletado)}`
                : "Motivos de los desequilibrios, fortalezas y próximos pasos"}
            </p>
          </div>
        </div>

        {hasAiFeatures && canAnalyse && !inProgress && (
          <button
            type="button"
            onClick={() => onAnalyse(Boolean(result))}
            disabled={isRequesting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRequesting ? <Spinner className="h-3.5 w-3.5" /> : <SparkleIcon className="h-3.5 w-3.5" />}
            {result ? "Regenerar" : analysis?.estado === "Error" ? "Reintentar" : "Analizar con IA"}
          </button>
        )}
      </div>

      {!hasAiFeatures && (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <CrownIcon style={{ width: 14, height: 14 }} className="text-amber-500" />
          Disponible en los planes Growth y Enterprise. Contacta con EvalFlow para mejorar tu plan.
        </p>
      )}

      {hasAiFeatures && !canAnalyse && !analysis && (
        <p className="mt-3 text-sm text-slate-500">
          Podrás analizarla con IA cuando las evaluaciones estén completadas.
        </p>
      )}

      {hasAiFeatures && inProgress && (
        <p className="mt-3 flex items-center gap-2 text-sm text-violet-700">
          <Spinner className="h-4 w-4" />
          {analysis?.estado === "Procesando"
            ? "Analizando las respuestas…"
            : "En cola. El análisis aparecerá aquí en cuanto esté listo."}
        </p>
      )}

      {hasAiFeatures && analysis?.estado === "Error" && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertTriangleIcon className="h-4 w-4" />
          {analysis.errorMensaje ?? "No se pudo generar el análisis."}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap items-start gap-2">
            <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_CLASS[result.nivelRiesgo]}`}>
              Riesgo {result.nivelRiesgo.toLowerCase()}
            </span>
            <p className="min-w-0 flex-1 text-slate-700">{result.resumen}</p>
          </div>

          {result.causasProbables.length > 0 && (
            <div>
              <SectionTitle>Motivos probables</SectionTitle>
              <ul className="mt-2 space-y-2">
                {result.causasProbables.map((cause, i) => (
                  <li key={i} className="rounded-lg border border-slate-100 bg-white px-3.5 py-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold text-slate-800">{cause.causa}</span>
                      <span className="text-xs text-slate-400">· {cause.tema}</span>
                      <span className={`ml-auto text-xs font-medium ${CONFIDENCE_CLASS[cause.confianza]}`}>
                        Confianza {cause.confianza.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">{cause.explicacion}</p>
                    {cause.preguntaIds.length > 0 && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Preguntas:{" "}
                        {cause.preguntaIds
                          .map((id) => questionTexts.get(id))
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    )}
                    {cause.evidencia.length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-violet-100 pl-3 text-xs text-slate-500">
                        {cause.evidencia.map((e, j) => (
                          <li key={j}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(result.fortalezas.length > 0 || result.areasDeMejora.length > 0) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <BulletList title="Fortalezas" items={result.fortalezas} dotClass="bg-emerald-500" />
              <BulletList title="Áreas de mejora" items={result.areasDeMejora} dotClass="bg-amber-500" />
            </div>
          )}

          {result.patrones.length > 0 && (
            <BulletList title="Patrones detectados" items={result.patrones} dotClass="bg-violet-500" />
          )}

          {result.recomendaciones.length > 0 && (
            <div>
              <SectionTitle>Recomendaciones</SectionTitle>
              <ul className="mt-2 space-y-1.5">
                {result.recomendaciones.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {RECIPIENT_LABEL[r.destinatario]}
                    </span>
                    <span className="text-slate-700">{r.accion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.solicitudesSugeridas.length > 0 && canRequestClarification && (
            <div>
              <SectionTitle>Información que convendría pedir</SectionTitle>
              <ul className="mt-2 space-y-2">
                {result.solicitudesSugeridas.map((s, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-white px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-700">{s.mensaje}</p>
                      {s.preguntaId !== null && questionTexts.has(s.preguntaId) && (
                        <p className="text-xs text-slate-400">{questionTexts.get(s.preguntaId)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSuggestedClarification(s.preguntaId, s.mensaje)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
                    >
                      <MailIcon className="h-3.5 w-3.5" />
                      Solicitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.limitaciones.length > 0 && (
            <p className="text-xs text-slate-400">
              <strong className="font-semibold">Limitaciones:</strong> {result.limitaciones.join(" · ")}
            </p>
          )}

          <p className="border-t border-violet-100 pt-3 text-[11px] text-slate-400">
            Generado por IA a partir de las respuestas y las solicitudes de información, sin nombres ni datos de
            contacto. Puede contener errores: úsalo como apoyo, no como decisión final.
          </p>
        </div>
      )}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</h4>;
}

function BulletList({ title, items, dotClass }: { title: string; items: string[]; dotClass: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-700">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
