"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteCompany } from "@/features/company/presentation/hooks/use-company";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { LockIcon, ShieldIcon } from "@/shared/ui/icons";

/**
 * Confirmation modal for deleting the company. Requires the current account
 * password. On success it performs a full logout (cookies are cleared
 * server-side; here we wipe localStorage + the query cache) and reloads /login.
 */
export function DeleteCompanyModal({ onClose }: { onClose: () => void }) {
  const deleteMutation = useDeleteCompany();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending = deleteMutation.isPending;

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Introduce tu contraseña para confirmar.");
      return;
    }
    try {
      await deleteMutation.mutateAsync({ password });
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
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la empresa. Inténtalo de nuevo.",
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
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-slate-900">
          Eliminar empresa
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Esta acción borra <strong>permanentemente</strong> la empresa y{" "}
          <strong>todos sus usuarios</strong>. No se puede deshacer. Introduce tu
          contraseña actual para confirmar.
        </p>

        <Field
          className="mt-5"
          label="Contraseña actual"
          type="password"
          icon={<LockIcon className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
            Cancelar
          </Button>
          <Button type="submit" variant="danger" loading={pending}>
            Eliminar definitivamente
          </Button>
        </div>
      </form>
    </div>
  );
}
