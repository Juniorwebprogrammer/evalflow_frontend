"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/features/auth/presentation/api/auth-client";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BrandPanel } from "@/features/auth/presentation/components/brand-panel";
import { KeyIcon, CheckCircleIcon, AlertTriangleIcon } from "@/shared/ui/icons";

/** Matches the backend's own policy (same as `ChangePassword`/`SecurityPanel`). */
const MIN_PASSWORD_LENGTH = 12;

/**
 * Landing screen for the password-recovery email link. Reads the `token`
 * (from the URL, via the page) and lets the caller set a new password
 * against the backend `Auth/reset-password` — invalid/expired tokens are
 * only discovered on submit, since the backend has no separate "check this
 * token" step.
 */
export function ResetPasswordView({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(token as string, password);
      setDone(result.message);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo restablecer la contraseña. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {!token ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Enlace no válido
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                El enlace de recuperación no es válido. Revisa el correo e
                inténtalo de nuevo.
              </p>
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => router.push("/login")}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          ) : done ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <CheckCircleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                ¡Contraseña actualizada!
              </h1>
              <p className="mt-2 text-sm text-slate-500">{done}</p>
              <Button
                type="button"
                className="mt-6 w-full"
                onClick={() => router.push("/login")}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900">
                Restablecer contraseña
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Elige una nueva contraseña de al menos {MIN_PASSWORD_LENGTH}{" "}
                caracteres.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Field
                  label="Nueva contraseña"
                  type="password"
                  icon={<KeyIcon className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                  autoFocus
                />
                <Field
                  label="Confirmar nueva contraseña"
                  type="password"
                  icon={<KeyIcon className="h-4 w-4" />}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />

                {error && <Notice tone="error">{error}</Notice>}

                <Button type="submit" className="w-full" loading={submitting}>
                  Restablecer contraseña
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
