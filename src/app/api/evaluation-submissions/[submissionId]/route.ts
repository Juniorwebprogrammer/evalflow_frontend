import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { readSession } from "@/features/auth/infrastructure/session-cookies";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";

/**
 * GET /api/evaluation-submissions/:submissionId
 * Returns a submission's shell (template title/description + ordered
 * questions) so the frontend can render the form. Reads the caller's JWT
 * from the session cookie and forwards it to the backend
 * `GET /evaluation-submissions/{submissionId}` as a bearer token. Answers
 * 404 (not an error body) when the submission does not exist or the caller
 * isn't its respondent.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-submissions/[submissionId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { submissionId } = await ctx.params;
    const submission = await useCases.getSubmissionById.execute(
      Number(submissionId),
      session.jwt,
    );

    if (!submission) {
      return Response.json(
        { message: "Formulario no encontrado." },
        { status: 404 },
      );
    }

    return Response.json(submission);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/evaluation-submissions/:submissionId
 * Deletes a submission (Owner/Rrhh only), e.g. to fix a mistake. Reads the
 * caller's JWT from the session cookie and forwards it to the backend
 * `DELETE /evaluation-submissions/{submissionId}` as a bearer token.
 */
export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/evaluation-submissions/[submissionId]">,
) {
  try {
    const session = await readSession();
    if (!session) {
      throw new DomainError("No autorizado. Inicia sesión de nuevo.", 401);
    }

    const { submissionId } = await ctx.params;
    const result = await useCases.deleteSubmission.execute(
      Number(submissionId),
      session.jwt,
    );

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
