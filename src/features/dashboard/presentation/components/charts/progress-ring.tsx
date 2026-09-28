import { SEQUENTIAL } from "@/features/dashboard/presentation/components/charts/chart-palette";

/**
 * Single-ratio meter drawn as a ring: the filled arc is `value / total`,
 * the unfilled track a lighter step of the same blue. The percentage sits
 * in the center, so the ring never has to be read on its own.
 */
export function ProgressRing({
  value,
  total,
  caption,
  size = 176,
  thickness = 16,
}: {
  value: number;
  total: number;
  caption: string;
  size?: number;
  thickness?: number;
}) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  const pct = Math.round(ratio * 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${pct}% ${caption} (${value} de ${total})`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={SEQUENTIAL.track}
          strokeWidth={thickness}
        />
        {ratio > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={SEQUENTIAL.base}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${ratio * circumference} ${circumference}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold text-slate-900">{pct}%</span>
        <span className="mt-0.5 text-xs text-slate-500">{caption}</span>
      </div>
    </div>
  );
}
