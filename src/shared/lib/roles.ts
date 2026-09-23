/**
 * Case-insensitive check for the two backend roles allowed to write
 * templates, questions and evaluation cycles (`AppRoles.Owner`,
 * `AppRoles.Rrhh`). The exact casing of those constants wasn't published —
 * this compares case-insensitively so a `"Owner"`/`"RRHH"`/`"Rrhh"` claim
 * all match. Purely a UI convenience: the backend is the source of truth
 * and still rejects unauthorized requests on its own.
 */
export function isPrivilegedRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return normalized === "owner" || normalized === "rrhh";
}
