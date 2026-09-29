"use client";

import { useState } from "react";
import {
  verify2FA,
  resend2FA,
} from "@/features/auth/presentation/api/auth-client";
import { errorMessage } from "@/shared/lib/api-error";
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
        text: errorMessage(err, "We couldn't verify the code.", {
          byDetail: [
            ["caducado", "This code has expired. Sign in again to get a new one."],
            ["incorrecto", "The code you entered is incorrect. Please check it and try again."],
            ["ningún código pendiente", "There's no pending code for this account. Sign in again to get a new one."],
            ["usuario no encontrado", "We couldn't find this account. Sign in again to get a new code."],
          ],
        }),
      });
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setNotice(null);
    try {
      await resend2FA(email);
      setNotice({ tone: "success", text: "We've sent you a new code." });
    } catch (err) {
      setNotice({
        tone: "error",
        text: errorMessage(err, "We couldn't resend the code."),
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
        Two-step verification
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
        We sent a verification code to{" "}
        <strong className="text-slate-700">{email}</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Verification code"
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
          Verify code
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-semibold text-[var(--brand)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? "Sending…" : "Send a new one"}
        </button>
      </div>
    </div>
  );
}
