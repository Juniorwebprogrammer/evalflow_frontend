/** Two-letter initials from a first and last name, e.g. "Laura", "Martínez" → "LM". */
export function initials(nombre: string, apellidos: string): string {
  return `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase() || "?";
}

/** Short localized date, e.g. "10 ago 2026". Returns "—" for empty/invalid input. */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
