/** Base domain error carrying an HTTP-like status so the transport layer can map it. */
export class DomainError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

/** Raised when a requested resource cannot be found upstream. */
export class NotFoundError extends DomainError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

/** Raised when the backend rejects the request or is unreachable. */
export class UpstreamError extends DomainError {
  constructor(message = "Error al comunicar con el servidor", status = 502) {
    super(message, status);
    this.name = "UpstreamError";
  }
}
