/**
 * Business-rule rejections from the backend `PUT /team/{userId}/superior`,
 * matched against its raw detail (see `errorMessage`'s `byDetail`).
 */
export const SUPERIOR_ERRORS: ReadonlyArray<readonly [string, string]> = [
  ["bucle", "This manager can't be assigned because it would create a loop in the reporting structure."],
  ["propio superior", "An employee can't be their own manager."],
  ["own manager", "An employee can't be their own manager."],
  [
    "el superior no existe",
    "The selected manager no longer exists. Refresh the page and choose another one.",
  ],
];
