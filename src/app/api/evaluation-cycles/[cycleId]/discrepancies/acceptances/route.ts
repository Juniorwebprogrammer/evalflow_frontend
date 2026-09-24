import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";
import type { AcceptedAnswerSource } from "@/features/evaluation-comparisons/domain/evaluation-comparison";

/** PUT /api/evaluation-cycles/:cycleId/discrepancies/acceptances — accepts imbalances choosing the final answer. */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/discrepancies/acceptances">,
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
      questionIds?: number[];
      source?: AcceptedAnswerSource;
    } | null;

    if (!body || !Array.isArray(body.questionIds)) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const result = await useCases.acceptDiscrepancies.execute(
      Number(cycleId),
      {
        evaluatedUserId: Number(body.evaluatedUserId),
        templateId: Number(body.templateId),
        questionIds: body.questionIds.map(Number),
        source: body.source as AcceptedAnswerSource,
      },
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
