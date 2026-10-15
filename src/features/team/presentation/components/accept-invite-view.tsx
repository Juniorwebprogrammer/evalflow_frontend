"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Invitation } from "@/features/team/domain/team";
import { fetchInvitation } from "@/features/team/presentation/api/team-client";
import { VexxenSignIn } from "@/features/auth/presentation/components/vexxen-sign-in";
import { BrandPanel } from "@/features/auth/presentation/components/brand-panel";
import { brandStyle, parseBrandColors } from "@/features/company/presentation/lib/brand";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { AlertTriangleIcon } from "@/shared/ui/icons";

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "error" }
  | { kind: "ready"; invitation: Invitation };

/**
 * Landing screen for the invitation email link, e.g.
 *   /accept-invite?token=xxxxx
 *
 * Accepting is signing in with Vexxen using the invited email: the backend links the Vexxen account to the
 * invited user on the first sign-in. People without a Vexxen account create it in the same popup.
 */
export function AcceptInviteView({ token }: { token: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<State>(token ? { kind: "loading" } : { kind: "invalid" });
  const [wrongEmail, setWrongEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchInvitation(token)
      .then((invitation) => {
        if (!cancelled) setState(invitation ? { kind: "ready", invitation } : { kind: "invalid" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const invitation = state.kind === "ready" ? state.invitation : null;
  const rootStyle = brandStyle(parseBrandColors(invitation?.companyColors));

  return (
    <div style={rootStyle} className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel companyName={invitation?.companyNombre} />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {state.kind === "loading" && <p className="text-sm text-slate-500">Loading your invitation…</p>}

          {(state.kind === "invalid" || state.kind === "error") && (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangleIcon className="h-6 w-6" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                {state.kind === "invalid" ? "This invitation isn't valid" : "We couldn't load your invitation"}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {state.kind === "invalid"
                  ? "It may have been accepted already. If so, just sign in. Otherwise, ask your administrator to send you a new one."
                  : "Please try again in a few minutes."}
              </p>
              <Button type="button" className="mt-6 w-full" onClick={() => router.push("/login")}>
                Go to sign in
              </Button>
            </div>
          )}

          {invitation && (
            <>
              <h2 className="text-2xl font-bold text-slate-900">Join {invitation.companyNombre}</h2>
              <p className="mt-1 text-sm text-slate-500">
                You&apos;ve been invited to the {invitation.companyNombre} evaluation dashboard on EvalFlow.
              </p>

              {invitation.expired ? (
                <Notice tone="warning" className="mt-6">
                  This invitation has expired. Ask your administrator to send you a new one.
                </Notice>
              ) : (
                <>
                  <p className="mt-6 text-sm text-slate-700">
                    Sign in with Vexxen using{" "}
                    <span className="font-semibold text-slate-900">{invitation.email}</span>. If you don&apos;t have a
                    Vexxen account yet, you can create one in the same window.
                  </p>
                  <div className="mt-4">
                    <VexxenSignIn
                      mode="login"
                      label="Accept with Vexxen"
                      onSignedIn={() => router.push("/dashboard")}
                      onNeedsOnboarding={(account) => setWrongEmail(account.email)}
                    />
                  </div>
                  {wrongEmail && (
                    <Notice tone="warning" className="mt-4">
                      You signed in as {wrongEmail}, but the invitation is for {invitation.email}. Sign in with that
                      email to accept it.
                    </Notice>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
