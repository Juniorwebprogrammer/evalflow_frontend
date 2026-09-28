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

/** Case-insensitive check for the company owner (`AppRoles.Owner`). */
export function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "owner";
}

/**
 * Screens every authenticated user can open (Employee, Superior, …):
 * dashboard, their own evaluations, the report downloads and their profile.
 * Owner/Rrhh can open every dashboard screen. Nested routes inherit the
 * access of their base path (`/dashboard/mis-evaluaciones/42`).
 */
const EMPLOYEE_SCREENS = [
  "/dashboard/mis-evaluaciones",
  "/dashboard/resultados-evaluacion",
  "/dashboard/perfil",
];

/**
 * Whether `role` may open the screen at `pathname`. Purely a UI guard — the
 * backend still rejects unauthorized requests on its own.
 */
export function canAccessScreen(
  role: string | null | undefined,
  pathname: string,
): boolean {
  if (isPrivilegedRole(role)) return true;
  if (pathname === "/dashboard") return true;
  return EMPLOYEE_SCREENS.some(
    (screen) => pathname === screen || pathname.startsWith(`${screen}/`),
  );
}
