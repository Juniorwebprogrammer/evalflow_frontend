import type { NextRequest } from "next/server";
import {
  EvaluationType,
  type UpdateEvaluationCycleInput,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/evaluation-cycles/:id
 * Updates an evaluation cycle. Reads the caller's JWT from the session
 * cookie and forwards it to the backend `PUT /evaluation-cycles/{id}` as a
 * bearer token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as
      | Partial<UpdateEvaluationCycleInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: UpdateEvaluationCycleInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Descripcion: body.Descripcion ? String(body.Descripcion).trim() : null,
      Activo: Boolean(body.Activo),
      FechaInicio: String(body.FechaInicio ?? ""),
      FechaFin: String(body.FechaFin ?? ""),
      TipoEvaluacion: body.TipoEvaluacion ?? EvaluationType.Evaluacion360,
    };

    const result = await useCases.updateEvaluationCycle.execute(
      Number(cycleId),
      input,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/evaluation-cycles/:id
 * Deletes an evaluation cycle. Reads the caller's JWT from the session
 * cookie and forwards it to the backend `DELETE /evaluation-cycles/{id}` as
 * a bearer token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const result = await useCases.deleteEvaluationCycle.execute(
      Number(cycleId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
