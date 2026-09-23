import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";

/**
 * GET /api/company/by-identification/:identificationId
 * Proxies to the backend `Company/get/by-identification/{id}`, keeping the
 * api key on the server. Public, like `/api/company/[name]` — the backend
 * endpoint itself takes no bearer token (see `HttpCompanyRepository`), and
 * pre-login screens need it too: the branded login page (`login-view.tsx`)
 * fetches the logo here before any session exists, and the email-verification
 * screen resolves the tenant name to redirect straight to the branded login.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/company/by-identification/[identificationId]">,
) {
  try {
    const { identificationId } = await ctx.params;
    const company = await useCases.getCompanyByIdentificationId.execute(
      decodeURIComponent(identificationId),
    );

    if (!company) {
      return Response.json(
        { message: "Empresa no encontrada" },
        { status: 404 },
      );
    }

    return Response.json({ company });
  } catch (error) {
    return handleError(error);
  }
}
