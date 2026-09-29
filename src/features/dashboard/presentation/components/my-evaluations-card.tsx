"use client";

import Link from "next/link";
import { usePendingSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-pending-submissions";
import { useCompletedSubmissions } from "@/features/evaluation-submissions/presentation/hooks/use-completed-submissions";
import { ChartCard } from "@/features/dashboard/presentation/components/chart-card";
import { ProgressRing } from "@/features/dashboard/presentation/components/charts/progress-ring";
import { SEQUENTIAL } from "@/features/dashboard/presentation/components/charts/chart-palette";
import { ChevronRightIcon } from "@/shared/ui/icons";
import { formatDate } from "@/shared/lib/format-date";
import { errorMessage } from "@/shared/lib/api-error";

/** Forms listed under the ring before linking to the full screen. */
const MAX_PENDING = 3;

/** The caller's own evaluations: share completed + the next pending forms. */
export function MyEvaluationsCard({ className = "" }: { className?: string }) {
  const pending = usePendingSubmissions();
  const completed = useCompletedSubmissions();
  const pendingList = pending.data ?? [];
  const completedCount = completed.data?.length ?? 0;
  const total = pendingList.length + completedCount;

  return (
    <ChartCard
      title="My evaluations"
      subtitle="Forms assigned to you"
      action={
        <Link
          href="/dashboard/mis-evaluaciones"
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          View all
        </Link>
      }
      loading={pending.isLoading || completed.isLoading}
      error={
        pending.error || completed.error
          ? errorMessage(pending.error ?? completed.error, "We couldn't load your evaluations.")
          : null
      }
      empty={total === 0 ? "You have no evaluations assigned right now." : null}
      className={className}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ProgressRing value={completedCount} total={total} caption="completed" size={152} />

        <div className="w-full min-w-0 flex-1">
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SEQUENTIAL.base }} />
                Completed
              </dt>
              <dd className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                {completedCount}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SEQUENTIAL.track }} />
                Pending
              </dt>
              <dd className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                {pendingList.length}
              </dd>
            </div>
          </dl>

          {pendingList.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {pendingList.slice(0, MAX_PENDING).map((s) => (
                <li key={s.submissionId}>
                  <Link
                    href={`/dashboard/mis-evaluaciones/${s.submissionId}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm transition hover:bg-slate-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-800">
                        {s.templateTitle}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {s.evaluatedUserName} · due {formatDate(s.fechaFinCiclo)}
                      </span>
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-emerald-600">You&apos;re all caught up! You have no pending forms.</p>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
