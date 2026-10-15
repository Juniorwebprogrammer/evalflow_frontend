"use client";

import { useRouter } from "next/navigation";
import type { Company } from "@/features/company/domain/company";
import type { NeedsOnboardingResponse } from "@/features/auth/presentation/api/auth-client";
import { VexxenSignIn } from "@/features/auth/presentation/components/vexxen-sign-in";

/**
 * Sign-in with Vexxen. Members go to the dashboard; people without a company get the onboarding (owned by
 * the parent). The company (from the URL) only brands the copy: who belongs where comes from the backend.
 */
export function LoginPanel({
  company,
  resolving,
  onNeedsOnboarding,
}: {
  company: Company | null;
  resolving: boolean;
  onNeedsOnboarding: (account: NeedsOnboardingResponse) => void;
}) {
  const router = useRouter();
  const goToDashboard = () => router.push("/dashboard");

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-500">
        {company
          ? `Sign in to the ${company.nombre} evaluation dashboard`
          : "Sign in to your evaluation dashboard"}
      </p>

      {resolving && <p className="mt-4 text-xs text-slate-400">Loading company…</p>}

      <div className="mt-6">
        <VexxenSignIn onSignedIn={goToDashboard} onNeedsOnboarding={onNeedsOnboarding} />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        EvalFlow uses your Vexxen account. Your password and two-step verification are managed in Vexxen.
      </p>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-sm font-semibold text-slate-900">New to EvalFlow?</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your Vexxen account, choose a plan (14-day free trial) and set up your company.
        </p>
        <div className="mt-4">
          <VexxenSignIn
            mode="register"
            label="Create your company"
            variant="outline"
            onSignedIn={goToDashboard}
            onNeedsOnboarding={onNeedsOnboarding}
          />
        </div>
      </div>
    </div>
  );
}
