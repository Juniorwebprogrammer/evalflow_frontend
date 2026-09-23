/** Formats an ISO date (or `yyyy-MM-dd`) as e.g. "12 feb 2026". Returns "—" if invalid. */
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

/** Converts an ISO date/date-time string to a `yyyy-MM-dd` value for a `<input type="date">`. */
export function toDateInputValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
