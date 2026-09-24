import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** GET /api/evaluation-cycles/:cycleId/clarifications — Owner/RRHH list with both answers. */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/clarifications">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const evaluatedUserId = request.nextUrl.searchParams.get("evaluatedUserId");

    const result = await useCases.getCycleClarifications.execute(
      Number(cycleId),
      evaluatedUserId ? Number(evaluatedUserId) : null,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/evaluation-cycles/:cycleId/clarifications — asks both participants for more information. */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/clarifications">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as {
      evaluatedUserId?: number;
      templateId?: number;
      questionId?: number | null;
      mensaje?: string;
    } | null;

    if (!body) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const result = await useCases.createClarification.execute(
      Number(cycleId),
      {
        evaluatedUserId: Number(body.evaluatedUserId),
        templateId: Number(body.templateId),
        questionId: body.questionId == null ? null : Number(body.questionId),
        mensaje: String(body.mensaje ?? ""),
      },
      session.jwt,
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
