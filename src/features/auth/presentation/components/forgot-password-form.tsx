"use client";

import { useState } from "react";
import { forgotPassword } from "@/features/auth/presentation/api/auth-client";
import { errorMessage } from "@/shared/lib/api-error";
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
      await forgotPassword(email);
      setResult(
        "If this email is registered, you'll receive a link to reset your password.",
      );
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't send the reset link."),
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
        <h2 className="mt-4 text-xl font-bold text-slate-900">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{result}</p>
        <Button type="button" className="mt-6 w-full" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-slate-900">Forgot your password?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Email"
          type="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane.doe@clinic.com"
          required
          autoFocus
        />

        {error && <Notice tone="error">{error}</Notice>}

        <Button type="submit" className="w-full" loading={submitting}>
          Send reset link
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          Back to sign in
        </button>
      </form>
    </div>
  );
}
