/**
 * Chart colors. Categorical slots are assigned in this fixed order (never
 * cycled, never by rank) and were validated as a set for color-vision
 * deficiency on the white card surface. Slots 3–5 sit below 3:1 contrast
 * against white, so every chart that uses them ships a legend with visible
 * values next to each swatch.
 */
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"] as const;

/** Single-hue (blue) steps for magnitude / progress. */
export const SEQUENTIAL = {
  track: "#e6effb",
  light: "#86b6ef",
  base: "#2a78d6",
  strong: "#1c5cab",
} as const;

/** Neutral used for "remaining" / "other" parts. */
export const NEUTRAL = "#cbd5e1";
