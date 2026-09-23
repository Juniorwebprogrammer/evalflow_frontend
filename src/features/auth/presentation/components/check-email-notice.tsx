"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { MailIcon } from "@/shared/ui/icons";
import { resendVerification } from "@/features/auth/presentation/api/auth-client";
import { ApiError } from "@/shared/lib/api-error";

/** Matches the backend's own no-spam window before a code/link can be resent. */
const RESEND_COOLDOWN_SECONDS = 120;

/**
 * Full-screen-ish notice asking the user to check their inbox. Shared by the
 * login form (email not verified yet) and the onboarding flow (account just
 * created, pending verification). Includes a "resend the verification link"
 * action (`Auth/resend-verification`), locked for 2 minutes after each send
 * so the user can't spam it.
 */
export function CheckEmailNotice({
  title,
  message,
  email,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  email?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendNotice(null);
    try {
      const result = await resendVerification(email);
      setResendNotice(result.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setResendNotice(
        err instanceof ApiError
          ? err.message
          : "No se pudo reenviar el enlace. Inténtalo de nuevo.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <MailIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {message}
        {email && (
          <>
            {" "}
            Hemos enviado el enlace a <strong className="text-slate-700">{email}</strong>.
          </>
        )}
      </p>

      {email && (
        <div className="mt-3 text-sm text-slate-500">
          ¿No te ha llegado?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="font-semibold text-[var(--brand)] hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
          >
            {resending
              ? "Enviando…"
              : cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : "Reenviar enlace"}
          </button>
        </div>
      )}

      {resendNotice && (
        <Notice tone="info" className="mt-3 text-left">
          {resendNotice}
        </Notice>
      )}

      <Button type="button" onClick={onAction} className="mt-6 w-full">
        {actionLabel}
      </Button>
    </div>
  );
}
