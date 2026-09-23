import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/auth/my-features → the authenticated user's role, its granted
 * features, and its description (backend `Auth/my-features`). No body —
 * just forwards the caller's JWT as a bearer token; the api key is added
 * server-side by the BackendClient.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const myFeatures = await useCases.getMyFeatures.execute(session.jwt);
    return Response.json(myFeatures);
  } catch (error) {
    return handleError(error);
  }
}
