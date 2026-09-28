"use client";

import { useState } from "react";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

const SIZE = 168;
const THICKNESS = 22;
const RADIUS = (SIZE - THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** 2px of card surface between touching segments. */
const GAP = 2;

function percent(value: number, total: number): string {
  return total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";
}

/**
 * Part-to-whole donut (≤ 6 segments). The legend lists every value and
 * share, so nothing depends on color or hover alone; hovering/focusing a
 * segment or its legend row swaps the center readout to that segment.
 */
export function DonutChart({
  segments,
  totalLabel,
}: {
  segments: DonutSegment[];
  /** What the total in the center counts, e.g. "empleados". */
  totalLabel: string;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  const active = segments.find((s) => s.key === activeKey) ?? null;
  const gap = visible.length > 1 ? GAP : 0;

  const lengths = visible.map((segment) => (segment.value / total) * CIRCUMFERENCE);
  const arcs = visible.map((segment, i) => ({
    segment,
    dash: Math.max(lengths[i] - gap, 0.5),
    offset: lengths.slice(0, i).reduce((sum, length) => sum + length, 0),
  }));

  return (
    // Container query: the legend sits beside the donut only when the card
    // itself is wide enough (it's often a narrow grid column on desktop).
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @sm:flex-row">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
            role="img"
            aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={THICKNESS}
            />
            {arcs.map(({ segment, dash, offset: segmentOffset }) => (
              <circle
                key={segment.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={segment.color}
                strokeWidth={activeKey === segment.key ? THICKNESS + 4 : THICKNESS}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-segmentOffset}
                opacity={activeKey && activeKey !== segment.key ? 0.35 : 1}
                className="cursor-pointer transition-[opacity,stroke-width] duration-150"
                onPointerEnter={() => setActiveKey(segment.key)}
                onPointerLeave={() => setActiveKey(null)}
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-slate-900">
              {active ? active.value : total}
            </span>
            <span className="max-w-[110px] truncate text-xs text-slate-500">
              {active ? `${active.label} · ${percent(active.value, total)}` : totalLabel}
            </span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-1">
          {segments.map((segment) => (
            <li key={segment.key}>
              <button
                type="button"
                onPointerEnter={() => setActiveKey(segment.key)}
                onPointerLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(segment.key)}
                onBlur={() => setActiveKey(null)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                  activeKey === segment.key ? "bg-slate-50" : ""
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: segment.color }}
                />
                <span className="min-w-0 flex-1 truncate text-slate-600">{segment.label}</span>
                <span className="font-semibold tabular-nums text-slate-900">{segment.value}</span>
                <span className="w-10 text-right text-xs tabular-nums text-slate-400">
                  {percent(segment.value, total)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
