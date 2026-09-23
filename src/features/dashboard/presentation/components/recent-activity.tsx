"use client";

import { CheckIcon } from "@/shared/ui/icons";
import { useRealtimeActivity } from "@/features/realtime/presentation/components/realtime-provider";
import { formatRelativeTime } from "@/shared/lib/date";

/**
 * Live feed fed by `RealtimeProvider` (SignalR `EvaluationCompleted` event).
 * Session-only by design: it starts empty on a fresh load and fills up as
 * evaluations complete while the tab is open — there's no activity log
 * persisted in the backend to hydrate it from.
 */
export function RecentActivity() {
  const activity = useRealtimeActivity();

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Actividad reciente</h2>

      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Sin actividad reciente todavía. Aparecerá aquí en cuanto alguien complete una evaluación.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {a.respondentUserName
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {a.respondentUserName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {a.isSelfEvaluation
                    ? "completó autoevaluación"
                    : `completó evaluación de ${a.evaluatedUserName}`}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <CheckIcon style={{ width: 16, height: 16 }} className="text-emerald-500" />
                <span className="text-[11px] text-slate-400">
                  {formatRelativeTime(a.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
