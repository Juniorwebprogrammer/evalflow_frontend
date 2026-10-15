"use client";

import { useState } from "react";
import type { AuthorizeMode, Tokens, VexxenAuthError } from "@vexxen/auth";
import { VexxenPopupClosedError } from "@vexxen/auth";
import { SignInWithVexxenButton, VexxenAuthProvider } from "@vexxen/auth/react";
import {
  signInWithVexxen,
  type NeedsOnboardingResponse,
  type SignedInResponse,
} from "@/features/auth/presentation/api/auth-client";
import { vexxenConfig } from "@/features/auth/presentation/lib/vexxen";
import { ApiError, errorMessage } from "@/shared/lib/api-error";
import { Notice } from "@/shared/ui/notice";

/** What each backend sign-in error means for the person. */
const MESSAGES: Record<string, string> = {
  INVITATION_EXPIRED: "Your invitation has expired. Ask your company to send you a new one.",
  USER_INACTIVE: "Your EvalFlow account is disabled. Talk to your company's administrator.",
  INVALID_VEXXEN_SESSION: "Your Vexxen sign-in didn't go through. Please try again.",
  VEXXEN_UNAVAILABLE: "We can't reach Vexxen right now. Please try again in a few minutes.",
};

export function signInErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return errorMessage(error, "We couldn't sign you in.", { byStatus: { 503: MESSAGES.VEXXEN_UNAVAILABLE } });
}

/**
 * "Continue with Vexxen": opens the Vexxen popup (password and, if the person has it, the two-step code),
 * then hands the tokens to our server. The caller decides what happens next: members go to the dashboard,
 * people without a company to onboarding.
 */
export function VexxenSignIn({
  mode = "login",
  label = "Continue with Vexxen",
  variant = "primary",
  onSignedIn,
  onNeedsOnboarding,
}: {
  mode?: AuthorizeMode;
  label?: string;
  variant?: "primary" | "outline";
  onSignedIn: (result: SignedInResponse) => void;
  onNeedsOnboarding: (result: NeedsOnboardingResponse) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!vexxenConfig) {
    return (
      <Notice tone="error">
        Sign-in isn&apos;t configured: NEXT_PUBLIC_VEXXEN_CLIENT_ID and NEXT_PUBLIC_VEXXEN_BASE_URL are missing.
      </Notice>
    );
  }

  async function handleTokens(tokens: Tokens) {
    setBusy(true);
    setError(null);
    try {
      const result = await signInWithVexxen(tokens);
      if (result.status === "signed_in") onSignedIn(result);
      else onNeedsOnboarding(result);
    } catch (err) {
      setError(signInErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleError(err: VexxenAuthError) {
    // Closing the window isn't an error worth showing.
    if (err instanceof VexxenPopupClosedError) return;
    setError("The Vexxen window couldn't complete the sign-in. Please try again.");
  }

  // The library's button only takes inline styles: these follow the company brand color.
  const style =
    variant === "primary"
      ? { width: "100%", height: 44, borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 14 }
      : { width: "100%", height: 44, borderRadius: 8, border: "1px solid var(--brand)", background: "#fff", color: "var(--brand)", fontWeight: 600, fontSize: 14, boxShadow: "none" };

  return (
    <VexxenAuthProvider config={vexxenConfig}>
      <div className="space-y-3">
        <SignInWithVexxenButton
          mode={mode}
          label={busy ? "Signing in…" : label}
          disabled={busy}
          onSuccess={handleTokens}
          onError={handleError}
          style={style}
        />
        {error && <Notice tone="warning">{error}</Notice>}
      </div>
    </VexxenAuthProvider>
  );
}
