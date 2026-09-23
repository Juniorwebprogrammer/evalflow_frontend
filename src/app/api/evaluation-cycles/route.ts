import type { NextRequest } from "next/server";
import {
  EvaluationType,
  type CreateEvaluationCycleInput,
} from "@/features/evaluation-cycles/domain/evaluation-cycle";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/evaluation-cycles
 * Lists every evaluation cycle of the caller's company. Reads the caller's
 * JWT from the session cookie and forwards it to the backend
 * `GET /evaluation-cycles` as a bearer token.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const result = await useCases.getAllEvaluationCycles.execute(session.jwt);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/evaluation-cycles
 * Creates an evaluation cycle for the caller's company. Reads the caller's
 * JWT from the session cookie and forwards it to the backend
 * `POST /evaluation-cycles` as a bearer token (the api key is added by the
 * BackendClient).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const body = (await request.json().catch(() => null)) as
      | Partial<CreateEvaluationCycleInput>
      | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const input: CreateEvaluationCycleInput = {
      Nombre: String(body.Nombre ?? "").trim(),
      Descripcion: body.Descripcion ? String(body.Descripcion).trim() : null,
      FechaInicio: String(body.FechaInicio ?? ""),
      FechaFin: String(body.FechaFin ?? ""),
      TipoEvaluacion: body.TipoEvaluacion ?? EvaluationType.Evaluacion360,
    };

    const result = await useCases.createEvaluationCycle.execute(input, session.jwt);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
