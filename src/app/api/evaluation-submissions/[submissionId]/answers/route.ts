import type { NextRequest } from "next/server";
import type { AnswerInput } from "@/features/evaluation-submissions/domain/evaluation-submission";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * PUT /api/evaluation-submissions/:submissionId/answers
 * Saves every answer of a submission in one shot and marks it completed.
 * Reads the caller's JWT from the session cookie and forwards it to the
 * backend `PUT /evaluation-submissions/{submissionId}/answers` as a bearer
 * token.
 */
export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/evaluation-submissions/[submissionId]/answers">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { submissionId } = await ctx.params;
    const body = (await request.json().catch(() => null)) as {
      answers?: Array<{ questionId?: number; rawPayload?: string }>;
    } | null;

    if (!body || !Array.isArray(body.answers)) {
      throw new DomainError("El cuerpo de la petición no es válido", 400);
    }

    const answers: AnswerInput[] = body.answers.map((a) => ({
      QuestionId: Number(a.questionId),
      RawPayload: String(a.rawPayload ?? ""),
    }));

    const result = await useCases.saveSubmissionAnswers.execute(
      Number(submissionId),
      answers,
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
