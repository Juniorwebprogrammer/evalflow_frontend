"use client";

import { useState } from "react";
import { SEQUENTIAL } from "@/features/dashboard/presentation/components/charts/chart-palette";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  /** Optional right-hand detail, e.g. "3 de 8". Defaults to the value. */
  detail?: string;
}

/**
 * Horizontal bars for comparing magnitudes across named categories — one
 * hue, one series, so no legend: the card title says what's measured. The
 * value sits at each row's end; the hovered/focused row lifts.
 *
 * With `max`, every bar is a share of that max (a per-row meter drawn on a
 * light track); without it, bars scale to the largest value.
 */
export function BarList({ items, max }: { items: BarListItem[]; max?: number }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const scale = max ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = scale > 0 ? (item.value / scale) * 100 : 0;
        const dimmed = activeKey !== null && activeKey !== item.key;
        return (
          <li
            key={item.key}
            tabIndex={0}
            onPointerEnter={() => setActiveKey(item.key)}
            onPointerLeave={() => setActiveKey(null)}
            onFocus={() => setActiveKey(item.key)}
            onBlur={() => setActiveKey(null)}
            className={`rounded-lg outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30 ${
              dimmed ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-slate-600">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                {item.detail ?? item.value}
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-r"
              style={{ background: max !== undefined ? SEQUENTIAL.track : "transparent" }}
            >
              <div
                className="h-full rounded-r transition-[width] duration-500"
                style={{
                  width: `${width}%`,
                  minWidth: item.value > 0 ? 4 : 0,
                  background: activeKey === item.key ? SEQUENTIAL.strong : SEQUENTIAL.base,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
