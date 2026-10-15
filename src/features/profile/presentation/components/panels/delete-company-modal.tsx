"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteCompany } from "@/features/company/presentation/hooks/use-company";
import { errorMessage } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BuildingIcon, ShieldIcon } from "@/shared/ui/icons";

/**
 * Confirmation modal for deleting the company: the owner types its name. On success it performs a full
 * logout (cookies are cleared server-side; here we wipe localStorage + the query cache) and reloads /login.
 * The EvalFlow subscription lives in Vexxen and isn't touched: the owner cancels it there.
 */
export function DeleteCompanyModal({ companyName, onClose }: { companyName: string; onClose: () => void }) {
  const deleteMutation = useDeleteCompany();
  const queryClient = useQueryClient();
  const [typedName, setTypedName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending = deleteMutation.isPending;

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (typedName.trim().toLowerCase() !== companyName.trim().toLowerCase()) {
      setError("Type the company name exactly as shown to confirm.");
      return;
    }
    try {
      await deleteMutation.mutateAsync({ companyName: typedName.trim() });
      // Full session teardown, then a hard reload so no stale state remains.
      queryClient.clear();
      try {
        window.localStorage.clear();
      } catch {
        // ignore storage access errors
      }
      window.location.assign("/login");
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't delete the company.", {
          byDetail: [
            ["doesn't match", "The company name doesn't match. Check it and try again."],
          ],
        }),
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={pending ? undefined : onClose}
      />

      <form
        onSubmit={confirm}
        className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Delete company
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          This <strong>permanently</strong> deletes the company and{" "}
          <strong>all of its users</strong>. It can&apos;t be undone. Type{" "}
          <strong>{companyName}</strong> to confirm.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Your EvalFlow subscription is managed in Vexxen: cancel it there so you aren&apos;t charged again.
        </p>

        <Field
          className="mt-5"
          label="Company name"
          icon={<BuildingIcon className="h-4 w-4" />}
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder={companyName}
          autoFocus
        />

        {error && (
          <Notice tone="error" className="mt-4">
            {error}
          </Notice>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={pending}>
            Delete permanently
          </Button>
        </div>
      </form>
    </div>
  );
}
