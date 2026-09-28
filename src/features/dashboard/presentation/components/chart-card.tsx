import type { ReactNode } from "react";

/**
 * Dashboard card: title + optional subtitle/action, then the chart body.
 * `loading` swaps the body for a pulse placeholder of the same height and
 * `empty` for a short message, so the grid never jumps around.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  loading = false,
  empty,
  error,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  /** Message shown instead of the chart when there's no data. */
  empty?: string | null;
  /** Message shown instead of the chart when the data failed to load. */
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </header>

      <div className="mt-5 flex-1">
        {loading ? (
          <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : empty ? (
          <p className="flex h-full min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center text-sm text-slate-500">
            {empty}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
