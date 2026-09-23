import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";

/**
 * GET /api/company/:name
 * Proxies to the backend `Company/get/by-name/{name}` endpoint, keeping the
 * api key on the server. Returns 404 (not an error body) when the company
 * does not exist, so the client can trigger the onboarding flow.
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/company/[name]">,
) {
  try {
    const { name } = await ctx.params;
    const company = await useCases.getCompanyByName.execute(
      decodeURIComponent(name.toLowerCase()),
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
