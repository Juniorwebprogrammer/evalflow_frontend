"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerOwner } from "@/features/onboarding/presentation/api/onboarding-client";
import {
  recheckVexxen,
  type NeedsOnboardingResponse,
} from "@/features/auth/presentation/api/auth-client";
import { ApiError, errorMessage } from "@/shared/lib/api-error";
import { WelcomeStep } from "@/features/onboarding/presentation/components/welcome-step";
import { PlanStep } from "@/features/onboarding/presentation/components/plan-step";
import { CompanyStep } from "@/features/onboarding/presentation/components/company-step";
import type {
  CompanyData,
  OnboardingStep,
} from "@/features/onboarding/presentation/components/types";
import { SECTORS } from "@/shared/data/sectors";

const SIGN_IN_AGAIN = "Your Vexxen sign-in has expired. Close this window and sign in again.";

/**
 * Wizard for someone signed in with Vexxen who doesn't belong to any company yet: welcome → choose a plan in
 * Vexxen (only if they don't have one) → their company. Creating the company signs them in as its owner.
 */
export function OnboardingPanel({
  account,
  onClose,
}: {
  account: NeedsOnboardingResponse;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [hasPlan, setHasPlan] = useState(account.hasPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState<CompanyData>({
    CompanyNombre: "",
    CompanyColors: "#2563eb",
    Sector: SECTORS[0],
    DireccionFiscal: "",
    Cif: "",
  });

  function goTo(next: OnboardingStep) {
    setError(null);
    setStep(next);
  }

  // Back from Vexxen: has the plan (or trial) started yet?
  async function checkPlan() {
    setError(null);
    setSubmitting(true);
    try {
      const result = await recheckVexxen();
      if (result.status === "signed_in") {
        // They were invited to a company meanwhile: nothing to set up.
        router.push("/dashboard");
        return;
      }
      if (result.hasPlan) {
        setHasPlan(true);
        goTo("company");
      } else {
        setError("We can't see an EvalFlow plan on your Vexxen account yet. Finish choosing it in Vexxen, then try again.");
      }
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? SIGN_IN_AGAIN : errorMessage(err, "We couldn't check your plan."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCompany(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerOwner(company);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.code === "NO_PLAN") {
        setHasPlan(false);
        goTo("plan");
      } else if (err instanceof ApiError && err.status === 401) {
        setError(SIGN_IN_AGAIN);
      } else {
        setError(
          errorMessage(err, "We couldn't create your company.", {
            byStatus: {
              409: "Your Vexxen account already belongs to a company in EvalFlow (or has a pending invitation). Sign in instead.",
            },
          }),
        );
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {(step === "plan" || step === "company") && (
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <StepDot active label="1. Plan" done={step === "company"} />
            <span className="h-px flex-1 bg-slate-200" />
            <StepDot active={step === "company"} label="2. Company" />
          </div>
        )}

        <div className="p-5 sm:p-7">
          {step === "welcome" && (
            <WelcomeStep
              firstName={account.firstName}
              email={account.email}
              onStart={() => goTo(hasPlan ? "company" : "plan")}
              onCancel={onClose}
            />
          )}

          {step === "plan" && (
            <PlanStep
              catalogUrl={account.catalogUrl}
              onBack={() => goTo("welcome")}
              onCheck={checkPlan}
              error={error}
              checking={submitting}
            />
          )}

          {step === "company" && (
            <CompanyStep
              value={company}
              onChange={(patch) => setCompany({ ...company, ...patch })}
              onBack={() => goTo(account.hasPlan ? "welcome" : "plan")}
              onSubmit={submitCompany}
              error={error}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done?: boolean;
  label: string;
}) {
  return (
    <span
      className={`text-xs font-semibold ${
        active || done ? "text-[var(--brand)]" : "text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}
