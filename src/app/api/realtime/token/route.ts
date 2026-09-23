import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/realtime/token
 * Hands the browser's SignalR client the caller's own session JWT so it can
 * authenticate directly against the backend's `/hubs/dashboard` hub (Route
 * Handlers can't keep a WebSocket alive, so the connection can't be proxied
 * through our own API — see `RealtimeProvider`). This is the one place the
 * JWT leaves the server; it's short-lived (1h) and only ever kept in the
 * SignalR client's memory, never persisted in the browser.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    return Response.json({ accessToken: session.jwt });
  } catch (error) {
    return handleError(error);
  }
}
