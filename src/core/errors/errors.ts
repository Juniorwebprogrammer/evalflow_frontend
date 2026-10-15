/** Base domain error carrying an HTTP-like status so the transport layer can map it. */
export class DomainError extends Error {
  readonly status: number;
  /** Stable machine-readable reason from the backend (e.g. "PLAN_INACTIVE", "NO_PLAN"), when it sends one. */
  readonly code?: string;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.name = "DomainError";
    this.status = status;
    this.code = code;
  }
}

/** Raised when a requested resource cannot be found upstream. */
export class NotFoundError extends DomainError {
  constructor(message = "Resource not found.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/** Raised when the backend rejects the request or is unreachable. */
export class UpstreamError extends DomainError {
  constructor(message = "Error communicating with the server.", status = 502, code?: string) {
    super(message, status, code);
    this.name = "UpstreamError";
  }
}
