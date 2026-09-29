/**
 * Shared browser-side HTTP helpers. Feature API clients build on these so the
 * error handling stays consistent — and so the api key never reaches the
 * browser (calls only ever hit our own Next.js route handlers).
 */

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Extracts the raw detail from a failed Response. This is the backend's own
 * text — useful for detecting specific cases, but never meant to be shown
 * as-is. Use `errorMessage` to build what the user reads.
 */
export async function parseMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.message ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach the server. Check your internet connection and try again.";

/** What went wrong, in plain words, for each kind of failure. */
function reasonFor(status: number): string {
  if (status === 400 || status === 422) {
    return "Please review the information and try again.";
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) {
    return "It may have been deleted, or you may no longer have access to it.";
  }
  if (status === 409) {
    return "It conflicts with the current data. Refresh the page and try again.";
  }
  if (status === 413) return "The file is too large.";
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (status === 503) {
    return "The service is temporarily unavailable. Please try again in a few minutes.";
  }
  if (status >= 500) {
    return "Something went wrong on our side. Please try again in a few minutes.";
  }
  return "Please try again.";
}

export interface ErrorMessageOptions {
  /** Replaces the whole message for specific statuses. */
  byStatus?: Partial<Record<number, string>>;
  /**
   * Replaces the whole message when the backend's raw detail contains the
   * given text (case-insensitive). Use it for business-rule rejections that
   * share a status but mean different things (e.g. "code expired" vs "code
   * incorrect", both 400). Checked before `byStatus`.
   */
  byDetail?: ReadonlyArray<readonly [match: string, message: string]>;
}

/**
 * Builds the message shown to the user when an action fails. `action`
 * describes what failed from the user's point of view (e.g. "We couldn't
 * save the template."), and a short reason is appended based on the status.
 * Raw status codes and backend text are never shown — see `options` for
 * giving specific cases a clearer explanation.
 */
export function errorMessage(
  error: unknown,
  action: string,
  options: ErrorMessageOptions = {},
): string {
  if (error instanceof ApiError) {
    const detail = error.message.toLowerCase();
    const known = options.byDetail?.find(([match]) =>
      detail.includes(match.toLowerCase()),
    );
    if (known) return known[1];
    return (
      options.byStatus?.[error.status] ?? `${action} ${reasonFor(error.status)}`
    );
  }
  // `fetch` rejects with a TypeError when the request never reached us.
  if (error instanceof TypeError) return `${action} ${NETWORK_MESSAGE}`;
  return `${action} Please try again.`;
}
