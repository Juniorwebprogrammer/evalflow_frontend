import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/** GET /api/evaluation-cycles/:cycleId/ai-analysis — latest AI analysis of each employee. */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/ai-analysis">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const evaluatedUserId = request.nextUrl.searchParams.get("evaluatedUserId");

    const result = await useCases.getCycleAiAnalyses.execute(
      Number(cycleId),
      evaluatedUserId ? Number(evaluatedUserId) : null,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/evaluation-cycles/:cycleId/ai-analysis — queues the AI analysis of the cycle (or one employee). */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-cycles/[cycleId]/ai-analysis">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { cycleId } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as {
      evaluatedUserId?: number;
      templateId?: number;
      force?: boolean;
    } | null;

    const result = await useCases.requestAiAnalysis.execute(
      Number(cycleId),
      {
        evaluatedUserId: body?.evaluatedUserId === undefined ? undefined : Number(body.evaluatedUserId),
        templateId: body?.templateId === undefined ? undefined : Number(body.templateId),
        force: body?.force === true,
      },
      session.jwt,
    );

    return Response.json(result, { status: 202 });
  } catch (error) {
    return handleError(error);
  }
}
