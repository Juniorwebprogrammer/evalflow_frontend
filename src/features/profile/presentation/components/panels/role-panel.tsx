"use client";

import { CrownIcon, CheckCircleIcon, AlertTriangleIcon } from "@/shared/ui/icons";
import { Button } from "@/shared/ui/button";
import { useMyFeatures } from "@/features/auth/presentation/hooks/use-my-features";

/** Shows the user's real role plus the features granted by the backend. */
export function RolePanel({ rol }: { rol: string }) {
  const { data, isLoading, isError } = useMyFeatures();
  const features = data?.features ?? [];
  const hasError = isError || (!isLoading && features.length === 0);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <CrownIcon className="h-6 w-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {rol || "Sin rol"}
            </h2>
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
              Rol asignado
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading
              ? "Cargando descripción del rol…"
              : data?.description || "Sin descripción disponible para este rol."}
          </p>
        </div>
      </div>

      <h3 className="mt-6 text-sm font-bold text-slate-900">
        Permisos de este rol
      </h3>

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-500">Cargando permisos…</p>
      ) : hasError ? (
        <div className="mt-3 flex flex-col items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0" />
            <span>
              Vaya, parece que hay un error. Contacta con soporte si el
              problema persiste.
            </span>
          </div>
          <Button type="button" variant="outline">
            Contactar con soporte
          </Button>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {features.map((feature) => (
            <li
              key={feature.code}
              className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
              {feature.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
