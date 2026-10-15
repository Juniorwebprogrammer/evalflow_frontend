"use client";

import { useEffect, useState } from "react";
import type { Company } from "@/features/company/domain/company";
import { fetchCompanyByName } from "@/features/company/presentation/api/company-client";
import { useCompany } from "@/features/company/presentation/hooks/use-company";
import {
  parseBrandColors,
  brandStyle,
} from "@/features/company/presentation/lib/brand";
import { BrandPanel } from "@/features/auth/presentation/components/brand-panel";
import type { NeedsOnboardingResponse } from "@/features/auth/presentation/api/auth-client";
import { LoginPanel } from "@/features/auth/presentation/components/login-panel";
import { OnboardingPanel } from "@/features/onboarding/presentation/components/onboarding-panel";

/**
 * Orchestrates the login screen.
 *  - If a company name was present in the URL, it is resolved through our
 *    Next.js route handler and its brand colors are applied.
 *  - Signing in with Vexxen as someone without a company opens the onboarding.
 */
export function LoginView({ companyName }: { companyName: string | null }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [resolving, setResolving] = useState<boolean>(Boolean(companyName));
  const [onboarding, setOnboarding] = useState<NeedsOnboardingResponse | null>(null);

  useEffect(() => {
    if (!companyName) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchCompanyByName(companyName);
        if (cancelled) return;
        // A company that doesn't exist just leaves the screen unbranded.
        if (result) setCompany(result);
      } catch {
        // Same: unbranded.
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyName]);

  const rootStyle = brandStyle(parseBrandColors(company?.colors));

  // The by-name lookup above doesn't carry the logo — fetch full company
  // details by identificationId (already cached elsewhere, e.g. the
  // organization settings panel) just for the logo.
  const identificationId =
    company?.identificationId != null ? String(company.identificationId) : "";
  const { data: companyInfo } = useCompany(identificationId);

  return (
    <div style={rootStyle} className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel companyName={company?.nombre} logoUrl={companyInfo?.logoUrl} />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <LoginPanel company={company} resolving={resolving} onNeedsOnboarding={setOnboarding} />
      </div>

      {onboarding && <OnboardingPanel account={onboarding} onClose={() => setOnboarding(null)} />}
    </div>
  );
}
