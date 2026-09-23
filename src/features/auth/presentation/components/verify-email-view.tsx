"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { verifyEmail } from "@/features/auth/presentation/api/auth-client";
import { fetchCompanyByIdentificationId } from "@/features/company/presentation/api/company-client";
import { ApiError } from "@/shared/lib/api-error";
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
  // resolve it to a name so "Ir a iniciar sesión" can open the branded
  // `/login/{empresa}` directly instead of the generic `/login`.
  const tenantId = data?.tenantId ?? null;
  const { data: company } = useQuery({
    queryKey: ["company-by-identification", tenantId],
    queryFn: () => fetchCompanyByIdentificationId(tenantId as string),
    enabled: Boolean(tenantId),
    retry: false,
  });

  const errorMessage = !token
    ? "El enlace de verificación no es válido. Revisa el correo e inténtalo de nuevo."
    : error instanceof ApiError
      ? error.message
      : error
        ? "No se pudo verificar el correo. Inténtalo de nuevo."
        : null;

  function goToLogin() {
    router.push(company?.nombre ? `/login/${encodeURIComponent(company.nombre)}` : "/login");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm text-center">
          {isLoading ? (
            <p className="text-sm text-slate-500">Verificando tu correo…</p>
          ) : errorMessage ? (
            <>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                No se pudo verificar tu correo
              </h1>
              <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <CheckCircleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                ¡Correo verificado!
              </h1>
              <p className="mt-2 text-sm text-slate-500">{data?.message}</p>
            </>
          )}

          <Button type="button" className="mt-6 w-full" onClick={goToLogin}>
            Ir a iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
