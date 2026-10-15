import type { NextRequest } from "next/server";
import { useCases } from "@/core/di/container";
import { handleError } from "@/app/api/_shared/handle-error";
import { DomainError } from "@/core/errors/errors";
import { applySignIn } from "./session";

/**
 * POST /api/auth/vexxen { accessToken, refreshToken }
 * The tokens the Vexxen popup gave the browser. The backend (`Auth/vexxen`) validates the access token with
 * Vexxen and answers with an EvalFlow session or "needs_onboarding". See `applySignIn` for the cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { accessToken?: unknown; refreshToken?: unknown } | null;
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken : "";
    const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";
    if (!accessToken || !refreshToken) throw new DomainError("Sign in with Vexxen first.", 400);

    const result = await useCases.signInWithVexxen.execute(accessToken);
    return Response.json(await applySignIn(result, { accessToken, refreshToken }));
  } catch (error) {
    return handleError(error);
  }
}
