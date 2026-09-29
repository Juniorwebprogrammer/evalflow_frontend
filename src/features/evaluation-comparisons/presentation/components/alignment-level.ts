import type {
  AlignmentLevel,
  GapDirection,
} from "@/features/evaluation-comparisons/presentation/api/evaluation-comparison-client";

const LEVEL_LABEL: Record<AlignmentLevel, string> = {
  Alineado: "Aligned",
  Leve: "Slight difference",
  Desequilibrio: "Imbalance",
  NoComparable: "Not compared",
};

const LEVEL_BADGE_CLASS: Record<AlignmentLevel, string> = {
  Alineado: "bg-emerald-50 text-emerald-600",
  Leve: "bg-amber-50 text-amber-600",
  Desequilibrio: "bg-red-50 text-red-600",
  NoComparable: "bg-slate-100 text-slate-500",
};

const DIRECTION_LABEL: Record<GapDirection, string> = {
  Ninguna: "",
  Sobrevaloracion: "Rates themselves higher than their manager does",
  Infravaloracion: "Rates themselves lower than their manager does",
};

export function alignmentLevelLabel(level: AlignmentLevel): string {
  return LEVEL_LABEL[level] ?? LEVEL_LABEL.NoComparable;
}

export function alignmentLevelClass(level: AlignmentLevel): string {
  return LEVEL_BADGE_CLASS[level] ?? LEVEL_BADGE_CLASS.NoComparable;
}

export function gapDirectionLabel(direction: GapDirection): string {
  return DIRECTION_LABEL[direction] ?? "";
}

export function formatScore(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatGap(value: number | null): string {
  if (value === null) return "—";
  const formatted = formatScore(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `−${formatted}`;
  return formatted;
}
