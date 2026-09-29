"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerOwner } from "@/features/onboarding/presentation/api/onboarding-client";
import { fetchCompanyByName } from "@/features/company/presentation/api/company-client";
import { CheckEmailNotice } from "@/features/auth/presentation/components/check-email-notice";
import { errorMessage } from "@/shared/lib/api-error";
import { WelcomeStep } from "@/features/onboarding/presentation/components/welcome-step";
import { AccountStep } from "@/features/onboarding/presentation/components/account-step";
import { CompanyStep } from "@/features/onboarding/presentation/components/company-step";
import { CompanyLookupStep } from "@/features/onboarding/presentation/components/company-lookup-step";
import type {
  AccountData,
  CompanyData,
  OnboardingStep,
} from "@/features/onboarding/presentation/components/types";
import { SECTORS } from "@/shared/data/sectors";

/**
 * Modal wizard that registers the owner + company. Owns the wizard state and
 * submission; each step is a presentational component. The modal cannot be
 * dismissed — the user must either register or find their company.
 */
export function OnboardingPanel() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [account, setAccount] = useState<AccountData>({
    UserNombre: "",
    Apellidos: "",
    Email: "",
    Password: "",
  });
  const [company, setCompany] = useState<CompanyData>({
    CompanyNombre: "",
    CompanyColors: "#2563eb",
    PlanId: 2,
    Sector: SECTORS[0],
    DireccionFiscal: "",
    Cif: "",
  });
  const [existingCompany, setExistingCompany] = useState("");

  function goTo(next: OnboardingStep) {
    setError(null);
    setStep(next);
  }

  async function findCompany(e: React.FormEvent) {
    e.preventDefault();
    const name = existingCompany.trim();
    if (!name) {
      setError("Enter your company name.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const found = await fetchCompanyByName(name);
      if (!found) {
        setError(
          "We couldn't find a company with that name. Check it and try again.",
        );
        setSubmitting(false);
        return;
      }
      // Redirect to the branded login using the canonical name, where the
      // company (and its identificationId) is resolved from the URL.
      router.push(`/login/${encodeURIComponent(found.nombre)}`);
    } catch (err) {
      setError(errorMessage(err, "We couldn't look up the company."));
      setSubmitting(false);
    }
  }

  function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (account.Password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    setStep("company");
  }

  async function submitCompany(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerOwner({ ...account, ...company });
      // The account exists but still needs email verification before the
      // backend allows login — no session is persisted, so show that step
      // instead of entering the dashboard.
      setStep("verify-email");
      setSubmitting(false);
    } catch (err) {
      setError(
        errorMessage(err, "We couldn't complete your registration.", {
          byDetail: [
            ["ya existe", "An account with this email already exists. Sign in instead, or use a different email."],
            ["plan seleccionado", "The selected plan isn't available. Please choose another one."],
            ["email no es válido", "Please enter a valid email address."],
            ["al menos", "Your password is too short. Please choose a longer one."],
          ],
          byStatus: {
            409: "An account with this email already exists. Sign in instead, or use a different email.",
          },
        }),
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Non-dismissable backdrop — no click-to-close. */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {(step === "account" || step === "company") && (
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <StepDot active label="1. Account" done={step === "company"} />
            <span className="h-px flex-1 bg-slate-200" />
            <StepDot active={step === "company"} label="2. Company" />
          </div>
        )}

        <div className="p-5 sm:p-7">
          {step === "welcome" && (
            <WelcomeStep
              onStart={() => goTo("account")}
              onExistingAccount={() => goTo("existing")}
            />
          )}

          {step === "existing" && (
            <CompanyLookupStep
              value={existingCompany}
              onChange={setExistingCompany}
              onBack={() => goTo("welcome")}
              onSubmit={findCompany}
              error={error}
              submitting={submitting}
            />
          )}

          {step === "account" && (
            <AccountStep
              value={account}
              onChange={(patch) => setAccount({ ...account, ...patch })}
              onBack={() => setStep("welcome")}
              onSubmit={submitAccount}
              error={error}
            />
          )}

          {step === "company" && (
            <CompanyStep
              value={company}
              onChange={(patch) => setCompany({ ...company, ...patch })}
              onBack={() => setStep("account")}
              onSubmit={submitCompany}
              error={error}
              submitting={submitting}
            />
          )}

          {step === "verify-email" && (
            <CheckEmailNotice
              title="Account created!"
              message="Confirm your email before you sign in."
              email={account.Email}
              actionLabel="Go to sign in"
              onAction={() =>
                router.push(`/login/${encodeURIComponent(company.CompanyNombre)}`)
              }
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
