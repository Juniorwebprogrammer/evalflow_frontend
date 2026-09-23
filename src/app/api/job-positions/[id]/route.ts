import type { NextRequest } from "next/server";
import type { JobPositionInput } from "@/features/job-positions/domain/job-position";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/job-positions/:id
 * Updates a job position's name/description. Reads the caller's JWT from
 * the session cookie and forwards it to the backend
 * `PUT /job-positions/{id}` as a bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/job-positions/[id]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { id } = await ctx.params;
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

    const result = await useCases.updateJobPosition.execute(
      Number(id),
      input,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/job-positions/:id
 * Deletes a job position. Reads the caller's JWT from the session cookie
 * and forwards it to the backend `DELETE /job-positions/{id}` as a bearer
 * token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/job-positions/[id]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { id } = await ctx.params;
    const result = await useCases.deleteJobPosition.execute(
      Number(id),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
