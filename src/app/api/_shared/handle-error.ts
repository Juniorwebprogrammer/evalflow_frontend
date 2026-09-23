import { DomainError } from "@/core/errors/errors";

/** Maps any thrown error into a JSON Response with a sensible status code. */
export function handleError(error: unknown): Response {
  if (error instanceof DomainError) {
    return Response.json({ message: error.message }, { status: error.status });
  }
  console.error("[api] unexpected error:", error);
  return Response.json(
    { message: "Se produjo un error inesperado" },
    { status: 500 },
  );
}
