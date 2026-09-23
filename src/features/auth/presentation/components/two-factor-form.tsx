"use client";

import { useState } from "react";
import {
  verify2FA,
  resend2FA,
} from "@/features/auth/presentation/api/auth-client";
import { ApiError } from "@/shared/lib/api-error";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { KeyIcon, MailIcon, CheckCircleIcon } from "@/shared/ui/icons";

type Notice_ = { tone: "success" | "error"; text: string } | null;

/**
 * The 2FA challenge screen shown after a login answers `requires2FA`. Takes
 * the emailed code, exchanges it for a session via `Auth/verify-2fa`, and
 * offers a "resend" action against `Auth/resend-2fa`.
 */
export function TwoFactorForm({
  email,
  onVerified,
}: {
  email: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<Notice_>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      await verify2FA({ email, code: code.trim() });
      onVerified();
    } catch (err) {
      setNotice({
        tone: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo verificar el código. Inténtalo de nuevo.",
      });
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setNotice(null);
    try {
      const result = await resend2FA(email);
      setNotice({ tone: "success", text: result.message });
    } catch (err) {
      setNotice({
        tone: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "No se pudo reenviar el código. Inténtalo de nuevo.",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <MailIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-center text-2xl font-bold text-slate-900">
        Verificación en dos pasos
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
        Hemos enviado un código de verificación a{" "}
        <strong className="text-slate-700">{email}</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Código de verificación"
          icon={<KeyIcon className="h-4 w-4" />}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          autoFocus
          required
        />

        {notice && (
          <Notice
            tone={notice.tone}
            icon={
              notice.tone === "success" ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              ) : undefined
            }
          >
            {notice.text}
          </Notice>
        )}

        <Button type="submit" className="w-full" loading={submitting}>
          Verificar código
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        ¿No te ha llegado el código?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-[var(--brand)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? "Enviando…" : "Solicítalo de nuevo"}
        </button>
      </div>
    </div>
  );
}
