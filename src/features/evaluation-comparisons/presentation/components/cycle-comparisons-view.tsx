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
import { useMyRole } from "@/features/profile/presentation/hooks/use-profile";
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
import {
  useCycleAiAnalyses,
  useHasAiFeatures,
  useRequestAiAnalysis,
} from "@/features/ai-analysis/presentation/hooks/use-ai-analyses";
import type { AiAnalysis } from "@/features/ai-analysis/domain/ai-analysis";
import { AiAnalysisPanel } from "@/features/ai-analysis/presentation/components/ai-analysis-panel";
import { aiRiskLabel } from "@/features/ai-analysis/presentation/components/ai-analysis-labels";
import { QuestionType } from "@/features/questions/domain/question";
import { EvaluationType } from "@/features/evaluation-cycles/domain/evaluation-cycle";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/format-date";
import { isPrivilegedRole } from "@/shared/lib/roles";
import { errorMessage } from "@/shared/lib/api-error";
import { roleLabel } from "@/features/team/presentation/lib/format";
import { Notice } from "@/shared/ui/notice";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MailIcon,
  ScaleIcon,
  SearchIcon,
  SparkleIcon,
  UsersIcon,
} from "@/shared/ui/icons";

export function CycleComparisonsView({ cycleId }: { cycleId: number }) {
  const { role, isLoading: isLoadingRole } = useMyRole();
  const canManage = isPrivilegedRole(role);
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
  const hasAiFeatures = useHasAiFeatures();
  const { data: aiAnalyses } = useCycleAiAnalyses(cycleId, { enabled: canManage && hasAiFeatures === true });
  const aiRequest = useRequestAiAnalysis(cycleId);
  const [aiQueuedMessage, setAiQueuedMessage] = useState<string | null>(null);

  const aiAnalysisByKey = useMemo(() => {
    const byKey = new Map<string, AiAnalysis>();
    for (const analysis of aiAnalyses ?? []) {
      byKey.set(comparisonKey(analysis.evaluatedUserId, analysis.templateId), analysis);
    }
    return byKey;
  }, [aiAnalyses]);

  async function handleAnalyse(input: { evaluatedUserId?: number; templateId?: number; force?: boolean }, key: string) {
    setAiQueuedMessage(null);
    try {
      const result = await aiRequest.request(input, key);
      if (key === "cycle") {
        setAiQueuedMessage(
          result.created === 0
            ? "The analyses are already up to date: no evaluation has changed since the last analysis."
            : `${result.created} ${result.created === 1 ? "analysis has" : "analyses have"} been queued. ${result.created === 1 ? "It" : "They"}'ll appear on each employee as soon as ${result.created === 1 ? "it's" : "they're"} ready.`,
        );
      }
    } catch {
      // Error is surfaced via `aiRequest.error`.
    }
  }

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
  const source = reviewSource(data?.tipoEvaluacion);
  const isReview = source !== null;
  const comparable = comparisons.filter((c) => isReady(c, source));
  const withImbalances = comparable.filter((c) => c.summary?.hasImbalances);
  const averageAlignment = averageOf(comparable.map((c) => c.summary?.alignmentPercentage ?? null));
  const averageScore = averageOf(comparable.map((c) => (c.summary ? sourceAverage(c.summary, source) : null)));

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
        Back to cycle
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
              <ScaleIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isReview ? "Results review" : "Evaluation comparison"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {data?.cycleName ? `${data.cycleName} · ` : ""}
                {isReview
                  ? `Each employee's ${source === "self" ? "self-assessment" : "manager evaluation"} answers. Review them and complete the evaluation to generate the reports.`
                  : "Self-assessment versus the manager's evaluation, question by question."}
              </p>
            </div>
          </div>

          {data && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex flex-wrap justify-end gap-2">
                {canManage && comparable.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAnalyse({}, "cycle")}
                    disabled={hasAiFeatures !== true || aiRequest.pendingKey !== null}
                    title={
                      hasAiFeatures === false
                        ? "AI analysis is available on the Growth and Enterprise plans"
                        : "Analyze every employee's completed evaluations with AI"
                    }
                  >
                    <SparkleIcon className="h-4 w-4" />
                    {aiRequest.pendingKey === "cycle" ? "Requesting…" : "Analyze with AI"}
                  </Button>
                )}
                {!isCompleted && (
                  <Button
                    type="button"
                    onClick={() => setShowComplete(true)}
                    disabled={pendingImbalances > 0}
                    title={
                      pendingImbalances > 0
                        ? "Accept every imbalance before completing the evaluation"
                        : undefined
                    }
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Complete evaluation
                  </Button>
                )}
              </div>
              {!isCompleted && pendingImbalances > 0 && (
                <p className="text-xs text-red-600">
                  {pendingImbalances} unaccepted {pendingImbalances === 1 ? "imbalance" : "imbalances"}
                </p>
              )}
            </div>
          )}
        </div>

        {aiRequest.error && (
          <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />} className="mt-5">
            {aiRequest.error}
          </Notice>
        )}

        {aiQueuedMessage && !aiRequest.error && (
          <Notice tone="info" icon={<SparkleIcon className="h-5 w-5" />} className="mt-5">
            {aiQueuedMessage}
          </Notice>
        )}

        {isCompleted && (
          <Notice tone="success" icon={<CheckCircleIcon className="h-5 w-5" />} className="mt-5">
            Evaluation completed
            {data?.completedAt ? ` on ${formatDate(data.completedAt)}` : ""}. The results have been
            saved and each employee can download their report.
          </Notice>
        )}

        {data && isReview && (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <Stat label="Evaluations" value={String(comparisons.length)} />
            <Stat label="Completed" value={String(comparable.length)} tone="success" />
            <Stat label="Pending" value={String(comparisons.length - comparable.length)} tone="danger" />
            <Stat label="Average score" value={formatScore(averageScore)} />
          </div>
        )}

        {data && !isReview && (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
            <Stat label="Evaluations" value={String(comparisons.length)} />
            <Stat label="Comparable" value={String(comparable.length)} />
            <Stat label="With imbalances" value={String(withImbalances.length)} tone="danger" />
            <Stat
              label="Average alignment"
              value={averageAlignment === null ? "—" : `${formatScore(averageAlignment)}%`}
              tone="success"
            />
          </div>
        )}
      </section>

      {!isLoadingRole && !canManage && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          Only the Owner and HR can view evaluation results.
        </Notice>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading results…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />}>
          {errorMessage(error, "We couldn't load the results.")}
        </Notice>
      )}

      {data && (
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <UsersIcon className="h-4 w-4 text-slate-400" />
              Employees ({visible.length})
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isReview && (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={onlyImbalances}
                    onChange={(e) => setOnlyImbalances(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--brand)]/30"
                  />
                  Only with imbalances
                </label>
              )}
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees…"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 sm:w-56"
                />
              </div>
            </div>
          </div>

          {comparisons.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">
              No forms have been generated in this cycle yet.
            </p>
          )}

          {comparisons.length > 0 && visible.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">No employees match the filters.</p>
          )}

          <div className="mt-4 space-y-3">
            {visible.map((comparison) => {
              const key = comparisonKey(comparison.evaluatedUserId, comparison.templateId);
              return (
                <EmployeeComparisonCard
                  key={key}
                  comparison={comparison}
                  source={source}
                  clarifications={clarificationsByKey.get(key) ?? []}
                  isCompleted={isCompleted}
                  resultId={resultIdByKey.get(key) ?? null}
                  aiAnalysis={aiAnalysisByKey.get(key)}
                  hasAiFeatures={hasAiFeatures}
                  isRequestingAi={aiRequest.pendingKey === key}
                  onAnalyse={(force) =>
                    handleAnalyse(
                      { evaluatedUserId: comparison.evaluatedUserId, templateId: comparison.templateId, force },
                      key,
                    )
                  }
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
                  onRequestClarification={(question, initialMessage) =>
                    setClarificationTarget({
                      evaluatedUserId: comparison.evaluatedUserId,
                      evaluatedUserName: comparison.evaluatedUserName,
                      managerName: comparison.managerName,
                      templateId: comparison.templateId,
                      templateTitle: comparison.templateTitle,
                      question,
                      initialMessage,
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

type RequestClarification = (
  question: { questionId: number; texto: string } | null,
  initialMessage?: string,
) => void;

type AcceptDiscrepancies = (questions: QuestionComparisonResponse[]) => void;

/**
 * Which single evaluation a non-360 cycle is reviewed from: "self" for Auto,
 * "manager" for 180. `null` means a 360 cycle (self vs manager comparison).
 */
type ReviewSource = "self" | "manager" | null;

function EmployeeComparisonCard({
  comparison,
  source,
  clarifications,
  isCompleted,
  resultId,
  aiAnalysis,
  hasAiFeatures,
  isRequestingAi,
  onAnalyse,
  onAcceptDiscrepancies,
  expanded,
  onToggle,
  onRequestClarification,
}: {
  comparison: EmployeeComparisonResponse;
  source: ReviewSource;
  clarifications: ClarificationResponse[];
  isCompleted: boolean;
  resultId: number | null;
  aiAnalysis: AiAnalysis | undefined;
  hasAiFeatures: boolean | undefined;
  isRequestingAi: boolean;
  onAnalyse: (force: boolean) => void;
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
  const isReview = source !== null;
  const questionTexts = useMemo(
    () => new Map(comparison.questions.map((q) => [q.questionId, q.texto])),
    [comparison.questions],
  );
  const aiRisk = aiAnalysis?.estado === "Completado" ? aiAnalysis.result?.nivelRiesgo : undefined;

  return (
    <div className="rounded-xl border border-slate-100">
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">{comparison.evaluatedUserName} - {roleLabel(comparison.evaluatedRol)}</p>
          <p className="text-xs text-slate-400">
            {comparison.templateTitle}
            {comparison.managerName ? ` · Manager: ${comparison.managerName}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isReady(comparison, source) && summary ? (
            <>
              {isReview ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {isCompleted ? "Report generated" : "Ready for report"}
                </span>
              ) : (
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
                  ? `${pendingImbalances.length} ${pendingImbalances.length === 1 ? "imbalance" : "imbalances"}`
                  : imbalancesAccepted
                    ? "Imbalances accepted"
                    : "Balanced"}
              </span>
              )}
              {clarifications.length > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600"
                  title={`${pendingClarifications} awaiting a response`}
                >
                  <MailIcon className="h-3.5 w-3.5" />
                  {clarifications.length} {clarifications.length === 1 ? "request" : "requests"}
                </span>
              )}
              {!isCompleted && !isReview && (
                <>
                  <button
                    type="button"
                    onClick={() => onRequestClarification(null)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Request information
                  </button>
                  {pendingImbalances.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onAcceptDiscrepancies(pendingImbalances)}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      {pendingImbalances.length === 1 ? "Accept imbalance" : "Accept imbalances"}
                    </button>
                  )}
                </>
              )}
              {aiRisk && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"
                  title="AI analysis available in the details"
                >
                  <SparkleIcon className="h-3.5 w-3.5" />
                  AI · {aiRiskLabel(aiRisk).toLowerCase()} risk
                </span>
              )}
              {resultId !== null && <DownloadReportLink resultId={resultId} />}
              <button
                type="button"
                onClick={onToggle}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
              >
                {expanded ? "Hide details" : "View details"}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <ClockIcon className="h-3.5 w-3.5" />
              {pendingLabel(comparison, source)}
            </span>
          )}
        </div>
      </div>

      {isReview && isReady(comparison, source) && summary && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>
            <strong className="text-slate-700">{summary.totalQuestions}</strong>{" "}
            {summary.totalQuestions === 1 ? "question" : "questions"}
          </span>
          <span>
            {sourceLabel(source)} average{" "}
            <strong className="text-slate-700">{formatScore(sourceAverage(summary, source))}</strong>
          </span>
        </div>
      )}

      {!isReview && comparison.isComparable && summary && (
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
                : `${formatScore(summary.alignmentPercentage)}% aligned`}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              <strong className="text-emerald-600">{summary.alineadas}</strong> aligned
            </span>
            <span>
              <strong className="text-amber-600">{summary.leves}</strong> slight
            </span>
            <span>
              <strong className="text-red-600">{summary.desequilibrios}</strong>{" "}
              {summary.desequilibrios === 1 ? "imbalance" : "imbalances"}
            </span>
            {summary.noComparables > 0 && (
              <span>
                <strong className="text-slate-600">{summary.noComparables}</strong> not compared
              </span>
            )}
            <span>
              Average: self-assessment <strong className="text-slate-700">{formatScore(summary.averageSelf)}</strong>{" "}
              · manager <strong className="text-slate-700">{formatScore(summary.averageManager)}</strong>
            </span>
          </div>
        </div>
      )}

      {expanded && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/50 px-4 py-4">
          <AiAnalysisPanel
            analysis={aiAnalysis}
            hasAiFeatures={hasAiFeatures}
            canAnalyse={isReady(comparison, source) && summary !== null}
            isRequesting={isRequestingAi}
            questionTexts={questionTexts}
            canRequestClarification={!isCompleted}
            onAnalyse={onAnalyse}
            onSuggestedClarification={(questionId, mensaje) => {
              const texto = questionId === null ? undefined : questionTexts.get(questionId);
              onRequestClarification(
                questionId !== null && texto ? { questionId, texto } : null,
                mensaje,
              );
            }}
          />
          {comparison.topics.length > 0 && <TopicsTable topics={comparison.topics} source={source} />}
          <QuestionsList
            questions={comparison.questions}
            source={source}
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

function TopicsTable({ topics, source }: { topics: TopicComparisonResponse[]; source: ReviewSource }) {
  if (source !== null) {
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">By topic</h3>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-3 py-2 font-medium">Topic</th>
                <th className="px-3 py-2 font-medium">Questions</th>
                <th className="px-3 py-2 font-medium">{sourceLabel(source)}</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.topic} className="border-b border-slate-50 last:border-0">
                  <td className="px-3 py-2 font-medium text-slate-700">{topic.topic}</td>
                  <td className="px-3 py-2 text-slate-600">{topic.numericQuestions}</td>
                  <td className="px-3 py-2 text-slate-600">
                    {formatScore(source === "self" ? topic.averageSelf : topic.averageManager)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">By topic</h3>
      <div className="mt-2 overflow-x-auto rounded-lg border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
              <th className="px-3 py-2 font-medium">Topic</th>
              <th className="px-3 py-2 font-medium">Self-assessment</th>
              <th className="px-3 py-2 font-medium">Manager</th>
              <th className="px-3 py-2 font-medium">Difference</th>
              <th className="px-3 py-2 font-medium">Level</th>
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
  source,
  isCompleted,
  onRequestClarification,
  onAcceptDiscrepancies,
}: {
  questions: QuestionComparisonResponse[];
  source: ReviewSource;
  isCompleted: boolean;
  onRequestClarification: RequestClarification;
  onAcceptDiscrepancies: AcceptDiscrepancies;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">By question</h3>
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
                      Ask for an explanation
                    </button>
                    <button
                      type="button"
                      onClick={() => onAcceptDiscrepancies([question])}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      {question.acceptedSource ? "Change" : "Accept"}
                    </button>
                  </>
                )}
                {question.acceptedSource && (
                  <span className="inline-flex shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Accepted: {question.acceptedSource === "Superior" ? "manager" : "self-assessment"}
                  </span>
                )}
                {source === null && <LevelBadge level={question.level} />}
              </div>
            </div>

            {source !== null ? (
              question.tipo === QuestionType.Seleccion ? (
                <div className="mt-2 text-xs">
                  <AnswerOptions
                    label={sourceLabel(source)}
                    options={source === "self" ? question.selfOptions : question.managerOptions}
                  />
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  {sourceLabel(source)}{" "}
                  <strong className="text-slate-700">
                    {formatScore(source === "self" ? question.selfValue : question.managerValue)}
                  </strong>
                </p>
              )
            ) : question.tipo === QuestionType.Seleccion ? (
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <AnswerOptions label="Self-assessment" options={question.selfOptions} />
                <AnswerOptions label="Manager" options={question.managerOptions} />
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span>
                  Self-assessment <strong className="text-slate-700">{formatScore(question.selfValue)}</strong>
                </span>
                <span>
                  Manager <strong className="text-slate-700">{formatScore(question.managerValue)}</strong>
                </span>
                <span>
                  Difference <strong className="text-slate-700">{formatGap(question.gap)}</strong>
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

function reviewSource(tipo: EvaluationType | undefined): ReviewSource {
  if (tipo === EvaluationType.Auto) return "self";
  if (tipo === EvaluationType.Evaluacion180) return "manager";
  return null;
}

function sourceLabel(source: ReviewSource): string {
  return source === "self" ? "Self-assessment" : "Manager";
}

function sourceAverage(
  summary: NonNullable<EmployeeComparisonResponse["summary"]>,
  source: ReviewSource,
): number | null {
  return source === "self" ? summary.averageSelf : summary.averageManager;
}

/** Whether the employee's answers can be shown: both evaluations in 360, the single one otherwise. */
function isReady(comparison: EmployeeComparisonResponse, source: ReviewSource): boolean {
  if (source === "self") return comparison.selfCompleted;
  if (source === "manager") return comparison.managerCompleted;
  return comparison.isComparable;
}

function pendingLabel(comparison: EmployeeComparisonResponse, source: ReviewSource): string {
  if (source === "self") return "Self-assessment missing";
  if (comparison.managerUserId === null) return "No manager evaluation";
  if (source === "manager") return "Manager evaluation missing";
  if (!comparison.selfCompleted && !comparison.managerCompleted) return "Both evaluations missing";
  if (!comparison.selfCompleted) return "Self-assessment missing";
  return "Manager evaluation missing";
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
