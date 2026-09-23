"use client";

import { useState } from "react";
import { forgotPassword } from "@/features/auth/presentation/api/auth-client";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { MailIcon, CheckCircleIcon } from "@/shared/ui/icons";

/**
 * "Forgot your password?" request form (backend `Auth/forgot-password`).
 * The backend always answers the same generic message whether or not the
 * email matched an active account, so the success state never confirms or
 * denies the account exists.
 */
export function ForgotPasswordForm({
  initialEmail,
  onBack,
}: {
  initialEmail?: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await forgotPassword(email);
      setResult(response.message);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo procesar la solicitud. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
          <CheckCircleIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Revisa tu correo</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{result}</p>
        <Button type="button" className="mt-6 w-full" onClick={onBack}>
          Volver a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-slate-900">¿Olvidaste tu contraseña?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Escribe tu correo y te enviaremos un enlace para restablecerla.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Correo electrónico"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ana.garcia@clinica.es"
          required
          autoFocus
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" className="w-full" loading={submitting}>
          Enviar enlace de recuperación
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          Volver a iniciar sesión
        </button>
      </form>
    </div>
  );
}
