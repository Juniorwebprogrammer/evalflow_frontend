"use client";

import { useState } from "react";
import type { Profile } from "@/features/profile/domain/profile";
import { Field } from "@/shared/ui/field";
import { Spinner } from "@/shared/ui/spinner";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { LockIcon, KeyIcon, CheckCircleIcon } from "@/shared/ui/icons";
import { useChangePassword } from "@/features/profile/presentation/hooks/use-profile";
import { useToggle2FA } from "@/features/settings/presentation/hooks/use-toggle-2fa";
import { errorMessage } from "@/shared/lib/api-error";

type Status = { tone: "success" | "error"; text: string } | null;

const MIN_PASSWORD_LENGTH = 12;

/**
 * Password change (wired to `Profile/change-password`) plus the 2FA toggle
 * (wired to `Settings/2fa`) — its initial state comes from
 * `profile.twoFactorEnabled`.
 */
export function SecurityPanel({ profile }: { profile: Profile }) {
  const changePasswordMutation = useChangePassword();
  const toggle2FAMutation = useToggle2FA();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  async function handleToggle2FA() {
    setTwoFactorError(null);
    try {
      await toggle2FAMutation.mutateAsync(!profile.twoFactorEnabled);
    } catch (err) {
      setTwoFactorError(
        errorMessage(
          err,
          profile.twoFactorEnabled
            ? "We couldn't turn off two-step verification."
            : "We couldn't turn on two-step verification.",
        ),
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (next.length < MIN_PASSWORD_LENGTH) {
      setStatus({
        tone: "error",
        text: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }
    if (next !== confirm) {
      setStatus({ tone: "error", text: "Passwords don't match." });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: current,
        newPassword: next,
      });
      setStatus({
        tone: "success",
        text: "Password updated.",
      });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setStatus({
        tone: "error",
        text: errorMessage(err, "We couldn't change your password.", {
          byDetail: [
            [
              "contraseña actual es incorrecta",
              "Your current password is incorrect. Check it and try again.",
            ],
            [
              "different from your current",
              "Your new password must be different from your current one.",
            ],
          ],
        }),
      });
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-bold text-slate-900">Change password</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Use a password of at least {MIN_PASSWORD_LENGTH} characters with
          numbers and symbols
        </p>

        <div className="mt-5 max-w-md space-y-4">
          <Field
            label="Current password"
            type="password"
            icon={<LockIcon className="h-4 w-4" />}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Field
            label="New password"
            type="password"
            icon={<KeyIcon className="h-4 w-4" />}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Field
            label="Confirm new password"
            type="password"
            icon={<KeyIcon className="h-4 w-4" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />

          {status && (
            <Notice
              tone={status.tone}
              icon={
                status.tone === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                ) : undefined
              }
            >
              {status.text}
            </Notice>
          )}

          <Button type="submit" loading={changePasswordMutation.isPending}>
            <KeyIcon className="h-4 w-4" />
            Update password
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div className="pr-6">
            <h3 className="text-base font-bold text-slate-900">
              Two-step verification
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Add an extra layer of security. You&apos;ll be asked for a
              verification code every time you sign in.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={profile.twoFactorEnabled}
            aria-label="Two-step verification"
            disabled={toggle2FAMutation.isPending}
            onClick={handleToggle2FA}
            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              profile.twoFactorEnabled ? "bg-[var(--brand)]" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow transition ${
                profile.twoFactorEnabled ? "left-[22px]" : "left-0.5"
              }`}
            >
              {toggle2FAMutation.isPending && <Spinner className="h-3 w-3" />}
            </span>
          </button>
        </div>

        {twoFactorError && (
          <Notice tone="error" className="mt-4">
            {twoFactorError}
          </Notice>
        )}
      </div>
    </div>
  );
}
