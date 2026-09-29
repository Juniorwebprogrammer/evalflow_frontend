/**
 * Reference list of company sectors, shared across features. The values are
 * what gets stored on the company (existing companies already carry them),
 * so they stay as-is — show `sectorLabel(value)` to the user instead.
 */
export const SECTORS = [
  "Salud",
  "Tecnología",
  "Educación",
  "Industria",
  "Servicios",
  "Retail",
];

const SECTOR_LABELS: Record<string, string> = {
  Salud: "Healthcare",
  Tecnología: "Technology",
  Educación: "Education",
  Industria: "Manufacturing",
  Servicios: "Services",
  Retail: "Retail",
};

/** English label for a stored sector value; unknown values are shown as-is. */
export function sectorLabel(value: string): string {
  return SECTOR_LABELS[value] ?? value;
}

/** Ready-made `{ value, label }` options for a sector `<Select>`. */
export const SECTOR_OPTIONS = SECTORS.map((value) => ({
  value,
  label: sectorLabel(value),
}));
