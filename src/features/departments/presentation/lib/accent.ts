/** Rotating accent palette used to color-code departments consistently across the app. */
const ACCENTS = [
  { bar: "#2563eb", soft: "#eff6ff", text: "#2563eb" }, // blue
  { bar: "#059669", soft: "#ecfdf5", text: "#059669" }, // emerald
  { bar: "#7c3aed", soft: "#f5f3ff", text: "#7c3aed" }, // violet
  { bar: "#d97706", soft: "#fffbeb", text: "#d97706" }, // amber
  { bar: "#dc2626", soft: "#fef2f2", text: "#dc2626" }, // red
] as const;

/** Picks a stable accent for a department, keyed by its id. */
export function departmentAccent(id: number) {
  return ACCENTS[id % ACCENTS.length];
}
