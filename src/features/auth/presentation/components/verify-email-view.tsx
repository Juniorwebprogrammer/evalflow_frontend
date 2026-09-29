"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { verifyEmail } from "@/features/auth/presentation/api/auth-client";
import { fetchCompanyByIdentificationId } from "@/features/company/presentation/api/company-client";
import { errorMessage } from "@/shared/lib/api-error";
import { Button } from "@/shared/ui/button";
import { BrandPanel } from "@/features/auth/presentation/components/brand-panel";
import { CheckCircleIcon, AlertTriangleIcon } from "@/shared/ui/icons";

/**
 * Landing screen for the verification email link. Validates the `token`
 * (read from the URL by the page) against the backend `Auth/verify-email`
 * and shows the outcome — success, invalid/expired token, or a missing token.
 */
export function VerifyEmailView({ token }: { token: string | null }) {
  const router = useRouter();

  const { data, error, isLoading } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => verifyEmail(token as string),
    enabled: Boolean(token),
    retry: false,
  });

  // The verify-email response only carries the company's identificationId —
  // resolve it to a name so "Go to sign in" can open the branded
  // `/login/{empresa}` directly instead of the generic `/login`.
  const tenantId = data?.tenantId ?? null;
  const { data: company } = useQuery({
    queryKey: ["company-by-identification", tenantId],
    queryFn: () => fetchCompanyByIdentificationId(tenantId as string),
    enabled: Boolean(tenantId),
    retry: false,
  });

  const failure = !token
    ? "This verification link isn't valid. Check the email and try again."
    : error
      ? errorMessage(error, "We couldn't verify your email.", {
          byDetail: [
            ["caducado", "This verification link has expired. Sign in to request a new one."],
            ["inválido", "This verification link isn't valid. Check the email and try again."],
          ],
        })
      : null;

  // The backend answers 200 for both a fresh verification and an
  // already-verified account; only its (Spanish) text tells them apart.
  const alreadyVerified = data?.message.toLowerCase().includes("anteriormente");

  function goToLogin() {
    router.push(company?.nombre ? `/login/${encodeURIComponent(company.nombre)}` : "/login");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm text-center">
          {isLoading ? (
            <p className="text-sm text-slate-500">Verifying your email…</p>
          ) : failure ? (
            <>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                We couldn&apos;t verify your email
              </h1>
              <p className="mt-2 text-sm text-slate-500">{failure}</p>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <CheckCircleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Email verified
              </h1>
              <p className="mt-2 text-sm text-slate-500">{alreadyVerified
                  ? "Your email was already verified. You can sign in now."
                  : "Your email has been verified. You can sign in now."}
              </p>
            </>
          )}

          <Button type="button" className="mt-6 w-full" onClick={goToLogin}>
            Go to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
