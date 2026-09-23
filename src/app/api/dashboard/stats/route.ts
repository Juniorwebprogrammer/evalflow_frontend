import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/dashboard/stats
 * Aggregated numbers for the dashboard home (active employees, departments,
 * active cycles, and the active cycle's progress). Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `GET /dashboard/stats` as a bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const stats = await useCases.getDashboardStats.execute(session.jwt);

    return Response.json(stats);
  } catch (error) {
    return handleError(error);
  }
}
