import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/evaluation-submissions/completed
 * Lists the caller's completed submissions. Reads the caller's JWT from the
 * session cookie and forwards it to the backend
 * `GET /evaluation-submissions/completed` as a bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.getMyCompletedSubmissions.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
