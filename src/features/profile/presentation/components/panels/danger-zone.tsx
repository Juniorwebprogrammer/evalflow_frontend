"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DeleteCompanyModal } from "@/features/profile/presentation/components/panels/delete-company-modal";

/** Destructive company actions. Only rendered for roles allowed to delete. */
export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-red-600">Zona de peligro</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Eliminar la empresa borra permanentemente la organización y todos sus
        usuarios. Esta acción no se puede deshacer.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          variant="danger"
          onClick={() => setConfirming(true)}
        >
          Eliminar empresa
        </Button>
      </div>

      {confirming && (
        <DeleteCompanyModal onClose={() => setConfirming(false)} />
      )}
    </div>
  );
}
