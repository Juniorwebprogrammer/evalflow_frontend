"use client";

import { useCycleEvaluationResults } from "@/features/evaluation-results/presentation/hooks/use-evaluation-results";
import { DownloadReportLink } from "@/features/evaluation-results/presentation/components/download-report-link";
import { formatScore } from "@/features/evaluation-comparisons/presentation/components/alignment-level";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon, TrendUpIcon } from "@/shared/ui/icons";
import { errorMessage } from "@/shared/lib/api-error";
import { formatDate } from "@/shared/lib/format-date";

/** Owner/HR list of every employee result of a completed cycle, with their PDF reports. */
export function CycleResultsSection({ cycleId }: { cycleId: number }) {
  const { data, isLoading, error } = useCycleEvaluationResults(cycleId);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <TrendUpIcon className="h-4 w-4 text-slate-400" />
        Evaluation results {data ? `(${data.length})` : ""}
      </h2>

      {isLoading && <p className="mt-3 text-sm text-slate-500">Loading results…</p>}

      {error && (
        <Notice tone="error" icon={<AlertTriangleIcon className="h-5 w-5" />} className="mt-3">
          {errorMessage(error, "We couldn't load the results.")}
        </Notice>
      )}

      {data && data.length > 0 && (
        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
          {data.map((result) => (
            <div key={result.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{result.evaluatedUserName}</p>
                <p className="text-xs text-slate-400">
                  {result.templateTitle} · {formatDate(result.completedAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">
                  Score <strong className="text-slate-800">{formatScore(result.averageFinal)}</strong>
                </span>
                <DownloadReportLink resultId={result.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
