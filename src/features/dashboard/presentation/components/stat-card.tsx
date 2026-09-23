import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sub: string;
  delta?: { text: string; tone: "up" | "down" | "flat" };
}

export function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  sub,
  delta,
}: StatCardProps) {
  const tone =
    delta?.tone === "up"
      ? "text-emerald-600"
      : delta?.tone === "down"
        ? "text-red-500"
        : "text-slate-400";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        {delta && (
          <span className={`text-xs font-semibold ${tone}`}>{delta.text}</span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}
