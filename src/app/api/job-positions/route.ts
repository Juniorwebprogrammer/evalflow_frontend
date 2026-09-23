import type { NextRequest } from "next/server";
import type { JobPositionInput } from "@/features/job-positions/domain/job-position";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/job-positions
 * Lists every job position of the caller's company. Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `GET /job-positions` as a bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.listJobPositions.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/job-positions
 * Creates a job position for the caller's company. Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `POST /job-positions` as a bearer token (the api key is added by the
 * BackendClient).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<JobPositionInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: JobPositionInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Descripcion: body.Descripcion ? String(body.Descripcion).trim() : null,
    };

    const result = await useCases.createJobPosition.execute(input, session.jwt);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
