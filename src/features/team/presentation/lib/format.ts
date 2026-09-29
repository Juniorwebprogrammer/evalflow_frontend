/** Two-letter initials from a first and last name, e.g. "Laura", "Martinez" → "LM". */
export function initials(nombre: string, apellidos: string): string {
  return `${nombre[0] ?? ""}${apellidos[0] ?? ""}`.toUpperCase() || "?";
}

/** Short localized date, e.g. "Aug 10, 2026". Returns "—" for empty/invalid input. */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  rrhh: "HR",
  superior: "Manager",
  employee: "Employee",
  administrator: "Administrator",
};

/** English label for a backend role value (`Owner`, `RRHH`, `Superior`, …). */
export function roleLabel(role: string | null | undefined): string {
  if (!role) return "";
  return ROLE_LABELS[role.trim().toLowerCase()] ?? role;
}
