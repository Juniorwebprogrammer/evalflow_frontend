import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";

/**
 * GET /api/team/invitation/:token
 * Public: the company and email of an invitation, for the accept page. 404 if it doesn't exist or was
 * already accepted.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const invitation = await useCases.getInvitation.execute(token);
    if (!invitation) {
      return Response.json({ message: "This invitation doesn't exist or was already accepted." }, { status: 404 });
    }
    return Response.json(invitation);
  } catch (error) {
    return handleError(error);
  }
}
