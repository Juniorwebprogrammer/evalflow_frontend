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

/** Extracts a human-friendly message from a failed Response. */
export async function parseMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data?.message ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}
