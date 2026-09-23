"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/features/company/domain/company";
import { login } from "@/features/auth/presentation/api/auth-client";
import { isEmailNotVerifiedError } from "@/features/auth/presentation/lib/login-errors";
import { CheckEmailNotice } from "@/features/auth/presentation/components/check-email-notice";
import { TwoFactorForm } from "@/features/auth/presentation/components/two-factor-form";
import { ForgotPasswordForm } from "@/features/auth/presentation/components/forgot-password-form";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { MailIcon, LockIcon } from "@/shared/ui/icons";

/**
 * The credentials form. Resolves nothing on its own — the parent passes the
 * already-resolved company so we can brand the copy and forward its
 * `identificationId` (kept only in memory for this request).
 */
export function LoginForm({
  company,
  resolving,
  onRequestOnboarding,
}: {
  company: Company | null;
  resolving: boolean;
  onRequestOnboarding: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      const result = await login({
        email,
        password,
        identificationId: company?.identificationId ?? null,
      });
      if (result.requires2FA) {
        setTwoFactorEmail(result.email);
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && isEmailNotVerifiedError(err.message)) {
        setAwaitingVerification(true);
        setSubmitting(false);
        return;
      }
      setNotice(
        err instanceof ApiError
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
      setSubmitting(false);
    }
  }

  if (twoFactorEmail) {
    return (
      <TwoFactorForm
        email={twoFactorEmail}
        onVerified={() => router.push("/dashboard")}
      />
    );
  }

  if (awaitingVerification) {
    return (
      <CheckEmailNotice
        title="Verifica tu correo para continuar"
        message="Debes confirmar tu cuenta antes de iniciar sesión."
        email={email}
        actionLabel="Volver a intentarlo"
        onAction={() => setAwaitingVerification(false)}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        initialEmail={email}
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h2>
      <p className="mt-1 text-sm text-slate-500">
        {company
          ? `Accede al panel de evaluaciones de ${company.nombre}`
          : "Accede a tu panel de evaluaciones"}
      </p>

      {resolving && (
        <p className="mt-4 text-xs text-slate-400">Cargando empresa…</p>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <Field
          label="Correo electrónico"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ana.garcia@clinica.es"
          required
        />
        <Field
          label="Contraseña"
          type="password"
          icon={<LockIcon className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-[var(--brand)]"
            />
            Recordarme
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button type="submit" className="w-full" loading={submitting}>
          Iniciar sesión
        </Button>

        {notice && <Notice tone="warning">{notice}</Notice>}
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        ¿Sin cuenta?{" "}
        <button
          type="button"
          onClick={onRequestOnboarding}
          className="font-semibold text-[var(--brand)] hover:underline"
        >
          Solicitar demo gratuita
        </button>
      </div>
    </div>
  );
}
