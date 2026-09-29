"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { DeleteCompanyModal } from "@/features/profile/presentation/components/panels/delete-company-modal";

/** Destructive company actions. Only rendered for roles allowed to delete. */
export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-red-600">Danger zone</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Deleting the company permanently removes the organization and all of
        its users. This can&apos;t be undone.
      </p>
      <div className="mt-4">
        <Button
          type="button"
          variant="danger"
          onClick={() => setConfirming(true)}
        >
          Delete company
        </Button>
      </div>

      {confirming && (
        <DeleteCompanyModal onClose={() => setConfirming(false)} />
      )}
    </div>
  );
}
