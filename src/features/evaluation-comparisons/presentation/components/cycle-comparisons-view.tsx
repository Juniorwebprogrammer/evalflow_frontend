"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCycleComparisons } from "@/features/evaluation-comparisons/presentation/hooks/use-cycle-comparisons";
import type {
  EmployeeComparisonResponse,
  QuestionComparisonResponse,
  TopicComparisonResponse,
} from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";
import {
  alignmentLevelClass,
  alignmentLevelLabel,
  formatGap,
  formatScore,
  gapDirectionLabel,
} from "@/features/evaluation-comparisons/presentation/components/alignment-level";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";
import { useCycleClarifications } from "@/features/clarifications/presentation/hooks/use-cycle-clarifications";
import type { ClarificationResponse } from "@/features/clarifications/presentation/api/clarification-client";
import { ClarificationsList } from "@/features/clarifications/presentation/components/clarifications-list";
import {
  RequestClarificationModal,
  type ClarificationTarget,
} from "@/features/clarifications/presentation/components/request-clarification-modal";
import {
  AcceptDiscrepancyModal,
  type AcceptDiscrepancyTarget,
} from "@/features/evaluation-comparisons/presentation/components/accept-discrepancy-modal";
import { CompleteCycleModal } from "@/features/evaluation-results/presentation/components/complete-cycle-modal";
import { DownloadReportLink } from "@/features/evaluation-results/presentation/components/download-report-link";
import { useCycleEvaluationResults } from "@/features/evaluation-results/presentation/hooks/use-evaluation-results";
import { QuestionType } from "@/features/questions/domain/question";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/format-date";
import { isPrivilegedRole } from "@/shared/lib/roles";
import { ApiError } from "@/shared/lib/api-error";
import { Notice } from "@/shared/ui/notice";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MailIcon,
  ScaleIcon,
  SearchIcon,
  UsersIcon,
} from "@/shared/ui/icons";

export function CycleComparisonsView({ cycleId }: { cycleId: number }) {
  const { data: myFeatures, isLoading: isLoadingFeatures } = useMyFeatures();
  const canManage = isPrivilegedRole(myFeatures?.role);
  const { data, isLoading, error } = useCycleComparisons(cycleId, { enabled: canManage });
  const [search, setSearch] = useState("");
  const [onlyImbalances, setOnlyImbalances] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [clarificationTarget, setClarificationTarget] = useState<ClarificationTarget | null>(null);
  const { data: clarifications } = useCycleClarifications(cycleId, { enabled: canManage });
  const [acceptTarget, setAcceptTarget] = useState<AcceptDiscrepancyTarget | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const isCompleted = data?.isCompleted ?? false;
  const pendingImbalances = data?.pendingImbalances ?? 0;
  const { data: results } = useCycleEvaluationResults(cycleId, { enabled: canManage && isCompleted });

  const resultIdByKey = useMemo(() => {
    const byKey = new Map<string, number>();
    for (const result of results ?? []) {
      byKey.set(comparisonKey(result.evaluatedUserId, result.templateId), result.id);
    }
    return byKey;
  }, [results]);

  const clarificationsByKey = useMemo(() => {
    const grouped = new Map<string, ClarificationResponse[]>();
    for (const clarification of clarifications ?? []) {
      const key = comparisonKey(clarification.evaluatedUserId, clarification.templateId);
      grouped.set(key, [...(grouped.get(key) ?? []), clarification]);
    }
    return grouped;
  }, [clarifications]);

  const comparisons = useMemo(() => data?.comparisons ?? [], [data]);
  const comparable = comparisons.filter((c) => c.isComparable);
  const withImbalances = comparable.filter((c) => c.summary?.hasImbalances);
  const averageAlignment = averageOf(comparable.map((c) => c.summary?.alignmentPercentage ?? null));

  const visible = comparisons.filter((c) => {
    const matchesSearch = c.evaluatedUserName.toLowerCase().includes(search.trim().toLowerCase());
    const matchesImbalance = !onlyImbalances || c.summary?.hasImbalances === true;
    return matchesSearch && matchesImbalance;
  });

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/ciclos-evaluacion/${cycleId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        Volver al ciclo
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <ScaleIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Comparación de evaluaciones</h1>
              <p className="mt-1 text-sm text-slate-500">
                {data?.cycleName ? `${data.cycleName} · ` : ""}Autoevaluación frente a la evaluación
                del superior, pregunta a pregunta.
              </p>
            </div>
          </div>

          {data && !isCompleted && (
            <div className="flex flex-col items-end gap-1">
              <Button
                type="button"
                onClick={() => setShowComplete(true)}
                disabled={pendingImbalances > 0}
                title={
                  pendingImbalances > 0
                    ? "Acepta todos los desequilibrios para poder completar la evaluación"
                    : undefined
                }
              >
                <CheckCircleIcon className="h-4 w-4" />
                Completar evaluación
              </Button>
              {pendingImbalances > 0 && (
                <p className="text-xs text-red-600">
                  {pendingImbalances} desequilibrio{pendingImbalances === 1 ? "" : "s"} sin aceptar
                </p>
              )}
            </div>
          )}
        </div>

        {isCompleted && (
          <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />} className="mt-5">
            Evaluación completada
            {data?.completedAt ? ` el ${formatDate(data.completedAt)}` : ""}. Los resultados ya están
            guardados y cada empleado puede descargar su informe.
          </Notice>
        )}

        {data && (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <Stat label="Evaluaciones" value={String(comparisons.length)} />
            <Stat label="Comparables" value={String(comparable.length)} />
            <Stat label="Con desequilibrios" value={String(withImbalances.length)} tone="danger" />
            <Stat
              label="Equilibrio medio"
              value={averageAlignment === null ? "—" : `${formatScore(averageAlignment)}%`}
              tone="success"
            />
          </div>
        )}
      </section>

      {!isLoadingFeatures && !canManage && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          Solo Owner y RRHH pueden ver la comparación de evaluaciones.
        </Notice>
      )}

      {isLoading && <p className="text-sm text-slate-500">Cargando comparación…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {error instanceof ApiError ? error.message : "No se pudo cargar la comparación."}
        </Notice>
      )}

      {data && (
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <UsersIcon className="h-4 w-4 text-slate-400" />
              Empleados ({visible.length})
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={onlyImbalances}
                  onChange={(e) => setOnlyImbalances(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30"
                />
                Solo con desequilibrios
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar empleado…"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 sm:w-56"
                />
              </div>
            </div>
          </div>

          {comparisons.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Todavía no hay formularios generados en este ciclo.
            </p>
          )}

          {comparisons.length > 0 && visible.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">Ningún empleado coincide con los filtros.</p>
          )}

          <div className="mt-4 space-y-3">
            {visible.map((comparison) => {
              const key = comparisonKey(comparison.evaluatedUserId, comparison.templateId);
              return (
                <EmployeeComparisonCard
                  key={key}
                  comparison={comparison}
                  clarifications={clarificationsByKey.get(key) ?? []}
                  isCompleted={isCompleted}
                  resultId={resultIdByKey.get(key) ?? null}
                  onAcceptDiscrepancies={(questions) =>
                    setAcceptTarget({
                      evaluatedUserId: comparison.evaluatedUserId,
                      evaluatedUserName: comparison.evaluatedUserName,
                      managerName: comparison.managerName,
                      templateId: comparison.templateId,
                      templateTitle: comparison.templateTitle,
                      questions,
                    })
                  }
                  expanded={expandedKey === key}
                  onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
                  onRequestClarification={(question) =>
                    setClarificationTarget({
                      evaluatedUserId: comparison.evaluatedUserId,
                      evaluatedUserName: comparison.evaluatedUserName,
                      managerName: comparison.managerName,
                      templateId: comparison.templateId,
                      templateTitle: comparison.templateTitle,
                      question,
                    })
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {clarificationTarget && (
        <RequestClarificationModal
          cycleId={cycleId}
          target={clarificationTarget}
          onClose={() => setClarificationTarget(null)}
        />
      )}

      {acceptTarget && (
        <AcceptDiscrepancyModal
          cycleId={cycleId}
          target={acceptTarget}
          onClose={() => setAcceptTarget(null)}
        />
      )}

      {showComplete && data && (
        <CompleteCycleModal
          cycleId={cycleId}
          cycleName={data.cycleName}
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  );
}

type RequestClarification = (question: { questionId: number; texto: string } | null) => void;

type AcceptDiscrepancies = (questions: QuestionComparisonResponse[]) => void;

function EmployeeComparisonCard({
  comparison,
  clarifications,
  isCompleted,
  resultId,
  onAcceptDiscrepancies,
  expanded,
  onToggle,
  onRequestClarification,
}: {
  comparison: EmployeeComparisonResponse;
  clarifications: ClarificationResponse[];
  isCompleted: boolean;
  resultId: number | null;
  onAcceptDiscrepancies: AcceptDiscrepancies;
  expanded: boolean;
  onToggle: () => void;
  onRequestClarification: RequestClarification;
}) {
  const summary = comparison.summary;
  const pendingImbalances = comparison.questions.filter(
    (q) => q.level === "Desequilibrio" && q.acceptedSource === null,
  );
  const imbalancesAccepted = summary?.hasImbalances === true && pendingImbalances.length === 0;
  const pendingClarifications = clarifications.filter((c) => c.estado !== "Respondida").length;

  return (
    <div className="rounded-xl border border-slate-100">
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{comparison.evaluatedUserName} - {comparison.evaluatedRol}</p>
          <p className="text-xs text-slate-400">
            {comparison.templateTitle}
            {comparison.managerName ? ` · Superior: ${comparison.managerName}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {comparison.isComparable && summary ? (
            <>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  pendingImbalances.length > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {pendingImbalances.length > 0 ? (
                  <AlertTriangleIcon className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                )}
                {pendingImbalances.length > 0
                  ? `${pendingImbalances.length} desequilibrio${pendingImbalances.length === 1 ? "" : "s"}`
                  : imbalancesAccepted
                    ? "Desequilibrios aceptados"
                    : "Equilibrado"}
              </span>
              {clarifications.length > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600"
                  title={`${pendingClarifications} pendiente${pendingClarifications === 1 ? "" : "s"} de respuesta`}
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  {clarifications.length} solicitud{clarifications.length === 1 ? "" : "es"}
                </span>
              )}
              {!isCompleted && (
                <>
                  <button
                    type="button"
                    onClick={() => onRequestClarification(null)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Solicitar información
                  </button>
                  {pendingImbalances.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onAcceptDiscrepancies(pendingImbalances)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Aceptar desequilibrio{pendingImbalances.length === 1 ? "" : "s"}
                    </button>
                  )}
                </>
              )}
              {resultId !== null && <DownloadReportLink resultId={resultId} />}
              <button
                type="button"
                onClick={onToggle}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
              >
                {expanded ? "Ocultar detalle" : "Ver detalle"}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <ClockIcon className="h-3.5 w-3.5" />
              {pendingLabel(comparison)}
            </span>
          )}
        </div>
      </div>

      {comparison.isComparable && summary && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${summary.alignmentPercentage ?? 0}%` }}
              />
            </div>
            <span className="w-24 text-right text-xs font-semibold text-slate-600">
              {summary.alignmentPercentage === null
                ? "—"
                : `${formatScore(summary.alignmentPercentage)}% equilibrio`}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              <strong className="text-emerald-600">{summary.alineadas}</strong> alineadas
            </span>
            <span>
              <strong className="text-amber-600">{summary.leves}</strong> leves
            </span>
            <span>
              <strong className="text-red-600">{summary.desequilibrios}</strong> desequilibrios
            </span>
            {summary.noComparables > 0 && (
              <span>
                <strong className="text-slate-600">{summary.noComparables}</strong> sin comparar
              </span>
            )}
            <span>
              Media: autoevaluación <strong className="text-slate-700">{formatScore(summary.averageSelf)}</strong>{" "}
              · superior <strong className="text-slate-700">{formatScore(summary.averageManager)}</strong>
            </span>
          </div>
        </div>
      )}

      {expanded && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          {comparison.topics.length > 0 && <TopicsTable topics={comparison.topics} />}
          <QuestionsList
            questions={comparison.questions}
            isCompleted={isCompleted}
            onRequestClarification={onRequestClarification}
            onAcceptDiscrepancies={onAcceptDiscrepancies}
          />
          {clarifications.length > 0 && <ClarificationsList clarifications={clarifications} />}
        </div>
      )}
    </div>
  );
}

function TopicsTable({ topics }: { topics: TopicComparisonResponse[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Por tema</h3>
      <div className="mt-2 overflow-x-auto rounded-lg border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-3 py-2 font-medium">Tema</th>
              <th className="px-3 py-2 font-medium">Autoevaluación</th>
              <th className="px-3 py-2 font-medium">Superior</th>
              <th className="px-3 py-2 font-medium">Diferencia</th>
              <th className="px-3 py-2 font-medium">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.topic} className="border-b border-slate-50 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-700">{topic.topic}</td>
                <td className="px-3 py-2 text-slate-600">{formatScore(topic.averageSelf)}</td>
                <td className="px-3 py-2 text-slate-600">{formatScore(topic.averageManager)}</td>
                <td className="px-3 py-2 text-slate-600" title={gapDirectionLabel(topic.direction)}>
                  {formatGap(topic.averageGap)}
                </td>
                <td className="px-3 py-2">
                  <LevelBadge level={topic.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuestionsList({
  questions,
  isCompleted,
  onRequestClarification,
  onAcceptDiscrepancies,
}: {
  questions: QuestionComparisonResponse[];
  isCompleted: boolean;
  onRequestClarification: RequestClarification;
  onAcceptDiscrepancies: AcceptDiscrepancies;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Por pregunta</h3>
      <div className="mt-2 space-y-2">
        {questions.map((question) => (
          <div
            key={question.questionId}
            className="rounded-lg border border-slate-100 bg-white px-3.5 py-3 text-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{question.texto}</p>
                <p className="text-xs text-slate-400">{question.topic}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {hasDiscrepancy(question) && !isCompleted && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestClarification({ questionId: question.questionId, texto: question.texto })
                      }
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
                    >
                      <MailIcon className="h-3.5 w-3.5" />
                      Pedir explicación
                    </button>
                    <button
                      type="button"
                      onClick={() => onAcceptDiscrepancies([question])}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      {question.acceptedSource ? "Cambiar" : "Aceptar"}
                    </button>
                  </>
                )}
                {question.acceptedSource && (
                  <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Aceptada: {question.acceptedSource === "Superior" ? "superior" : "autoevaluación"}
                  </span>
                )}
                <LevelBadge level={question.level} />
              </div>
            </div>

            {question.tipo === QuestionType.Seleccion ? (
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <AnswerOptions label="Autoevaluación" options={question.selfOptions} />
                <AnswerOptions label="Superior" options={question.managerOptions} />
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>
                  Autoevaluación <strong className="text-slate-700">{formatScore(question.selfValue)}</strong>
                </span>
                <span>
                  Superior <strong className="text-slate-700">{formatScore(question.managerValue)}</strong>
                </span>
                <span>
                  Diferencia <strong className="text-slate-700">{formatGap(question.gap)}</strong>
                </span>
                {gapDirectionLabel(question.direction) && (
                  <span className="text-slate-400">{gapDirectionLabel(question.direction)}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnswerOptions({ label, options }: { label: string; options: string[] | null }) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-2">
      <p className="font-semibold text-slate-500">{label}</p>
      <p className="mt-0.5 text-slate-700">
        {options && options.length > 0 ? options.join(", ") : "—"}
      </p>
    </div>
  );
}

function LevelBadge({ level }: { level: QuestionComparisonResponse["level"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${alignmentLevelClass(level)}`}
    >
      {alignmentLevelLabel(level)}
    </span>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const color =
    tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : "text-slate-800";

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function pendingLabel(comparison: EmployeeComparisonResponse): string {
  if (comparison.managerUserId === null) return "Sin evaluación del superior";
  if (!comparison.selfCompleted && !comparison.managerCompleted) return "Faltan ambas evaluaciones";
  if (!comparison.selfCompleted) return "Falta la autoevaluación";
  return "Falta la evaluación del superior";
}

function comparisonKey(evaluatedUserId: number, templateId: number): string {
  return `${evaluatedUserId}-${templateId}`;
}

function hasDiscrepancy(question: QuestionComparisonResponse): boolean {
  return question.level === "Desequilibrio" || question.level === "Leve";
}

function averageOf(values: (number | null)[]): number | null {
  const numbers = values.filter((v): v is number => v !== null);
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, v) => sum + v, 0) / numbers.length;
}
