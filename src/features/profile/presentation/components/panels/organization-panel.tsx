"use client";

import { Notice } from "@/shared/ui/notice";
import { useCompany } from "@/features/company/presentation/hooks/use-company";
import { OrganizationForm } from "@/features/profile/presentation/components/panels/organization-form";
import { DangerZone } from "@/features/profile/presentation/components/panels/danger-zone";

/** Roles allowed to edit the organization (mirrors the backend policy). */
const EDIT_ROLES = ["owner", "rrhh", "administrator"];
/** Roles allowed to delete the company (stricter than editing). */
const DELETE_ROLES = ["owner", "administrator"];

/**
 * Organization tab. Loads the company by identificationId and renders the
 * editable form. Read-only for roles that cannot edit (backend enforces too).
 */
export function OrganizationPanel({
  identificationId,
  rol,
}: {
  identificationId: string;
  rol: string;
}) {
  const normalizedRol = rol.trim().toLowerCase();
  const canEdit = EDIT_ROLES.includes(normalizedRol);
  const canDelete = DELETE_ROLES.includes(normalizedRol);
  const { data: company, isLoading, isError, error } = useCompany(
    identificationId,
  );

  return (
    <div className="space-y-4">
      {!canEdit && (
        <Notice tone="warning">
          Esta sección está disponible solo para el Owner de la organización.
        </Notice>
      )}

      {!identificationId ? (
        <Notice tone="info">
          No hay una empresa asociada a tu cuenta.
        </Notice>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando información de la empresa…
        </div>
      ) : isError || !company ? (
        <Notice tone="error">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar la información de la empresa."}
        </Notice>
      ) : (
        <OrganizationForm
          identificationId={identificationId}
          company={company}
          canEdit={canEdit}
        />
      )}

      {canDelete && <DangerZone />}
    </div>
  );
}
