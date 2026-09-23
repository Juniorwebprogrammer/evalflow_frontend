import { ACTIVITY_STATS } from "@/features/profile/presentation/data/example";

/** Example activity summary shown under the profile nav. */
export function ActivityCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-widest text-slate-400">
        ACTIVIDAD
      </p>
      <ul className="mt-3 space-y-2.5">
        {ACTIVITY_STATS.map((stat) => (
          <li
            key={stat.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-500">{stat.label}</span>
            <span className="font-bold text-slate-900">{stat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
