/**
 * Placeholder data for the profile screen. Only Nombre / Apellidos / Email /
 * Rol come from the backend (`Profile/me`); everything here is example data to
 * be reviewed and wired to real endpoints later.
 */

export const EXAMPLE_PROFILE = {
  lastAccess: "hoy 09:14",
  department: "Recursos Humanos",
  language: "Español",
};

export const DEPARTMENTS = [
  "Recursos Humanos",
  "Dirección",
  "Operaciones",
  "Finanzas",
  "Enfermería",
  "Administración",
];

export const LANGUAGES = ["Español", "English", "Català", "Français"];

export const ACTIVITY_STATS = [
  { label: "Ciclos gestionados", value: 7 },
  { label: "Análisis IA generados", value: 23 },
  { label: "Empleados supervisados", value: 48 },
];
