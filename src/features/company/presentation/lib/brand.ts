import type { BrandColors } from "@/features/company/domain/company";

/** A CSS style object carrying the brand custom properties. */
export type BrandStyle = Record<string, string>;

function normalizeHex(value: string): string | null {
  const v = value.trim();
  return /^#?[0-9a-fA-F]{6}$/.test(v) ? (v.startsWith("#") ? v : `#${v}`) : null;
}

/** Darkens/lightens a hex color by a percentage (-1..1). */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (x: number) => Math.max(0, Math.min(255, x));
  const r = clamp(((n >> 16) & 0xff) + Math.round(255 * amount));
  const g = clamp(((n >> 8) & 0xff) + Math.round(255 * amount));
  const b = clamp((n & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Parses the company `colors` string (a single hex or a comma-separated list)
 * into a full brand palette. Falls back to the default EvalFlow blue.
 */
export function parseBrandColors(colors: string | null | undefined): BrandColors {
  const fallback: BrandColors = {
    brand: "#2563eb",
    brandStrong: "#1d4ed8",
    brandSoft: "#3b82f6",
  };

  if (!colors) return fallback;

  const parts = colors
    .split(",")
    .map((c) => normalizeHex(c))
    .filter((c): c is string => Boolean(c));

  if (parts.length === 0) return fallback;

  return {
    brand: parts[0],
    brandStrong: parts[1] ?? shade(parts[0], -0.12),
    brandSoft: parts[2] ?? shade(parts[0], 0.12),
  };
}

/** Builds the inline style object that overrides the CSS brand variables. */
export function brandStyle(colors: BrandColors): BrandStyle {
  return {
    "--brand": colors.brand,
    "--brand-strong": colors.brandStrong,
    "--brand-soft": colors.brandSoft,
  };
}
