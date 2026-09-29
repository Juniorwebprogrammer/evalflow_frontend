/**
 * Backend rejections shared by creating, editing and (de)activating a cycle,
 * matched against the backend's raw detail — see `errorMessage`.
 */
export const CYCLE_SAVE_ERRORS: ReadonlyArray<readonly [string, string]> = [
  [
    "a la vez",
    "You've reached your plan's limit of active cycles. Deactivate another cycle or upgrade your plan.",
  ],
  [
    "por año",
    "You've reached your plan's limit of evaluation cycles for that year. Upgrade your plan to add more.",
  ],
  [
    "ya se ha completado",
    "This cycle has already been completed and can no longer be changed.",
  ],
  ["debe ser anterior", "The start date must be before the end date."],
];
