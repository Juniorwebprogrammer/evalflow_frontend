import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BuildingIcon, DocIcon, MapPinIcon } from "@/shared/ui/icons";
import type { CompanyData } from "@/features/onboarding/presentation/components/types";
import { SECTOR_OPTIONS } from "@/shared/data/sectors";
import type { Plan } from "@/features/plans/domain/plan";
import { usePlans } from "@/features/plans/presentation/hooks/use-plans";

/** Shown while `/api/plans` loads, or if it fails. */
const FALLBACK_PLANS = [
  { id: 1, name: "Starter", detail: "Up to 25 employees", ai: false },
  { id: 2, name: "Growth", detail: "Up to 100 employees", ai: true },
  { id: 3, name: "Enterprise", detail: "Unlimited employees", ai: true },
];

function toCard(plan: Plan) {
  return {
    id: plan.id,
    name: plan.nombre,
    detail: plan.maxEmployees === null ? "Unlimited employees" : `Up to ${plan.maxEmployees} employees`,
    ai: plan.hasAiFeatures,
  };
}

export function CompanyStep({
  value,
  onChange,
  onBack,
  onSubmit,
  error,
  submitting,
}: {
  value: CompanyData;
  onChange: (patch: Partial<CompanyData>) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  submitting: boolean;
}) {
  const { data: loadedPlans } = usePlans();
  const plans = loadedPlans && loadedPlans.length > 0 ? loadedPlans.map(toCard) : FALLBACK_PLANS;
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-xl font-bold text-slate-900">Your company</h2>
      <p className="mt-1 text-sm text-slate-500">
        Set up the organization you&apos;ll be evaluating.
      </p>

      <Field
        className="mt-5"
        label="Company name"
        icon={<BuildingIcon className="h-4 w-4" />}
        value={value.CompanyNombre}
        onChange={(e) => onChange({ CompanyNombre: e.target.value })}
        placeholder="St. Raphael Clinic"
        required
      />

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Tax ID"
          icon={<DocIcon className="h-4 w-4" />}
          value={value.Cif}
          onChange={(e) => onChange({ Cif: e.target.value })}
          placeholder="B-12345678"
          required
        />
        <Select
          label="Sector"
          options={SECTOR_OPTIONS}
          value={value.Sector}
          onChange={(e) => onChange({ Sector: e.target.value })}
        />
      </div>

      <Field
        className="mt-3"
        label="Registered address"
        icon={<MapPinIcon className="h-4 w-4" />}
        value={value.DireccionFiscal}
        onChange={(e) => onChange({ DireccionFiscal: e.target.value })}
        placeholder="45 Main Street, Springfield"
        required
      />

      <div className="mt-3">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Brand color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value.CompanyColors}
            onChange={(e) => onChange({ CompanyColors: e.target.value })}
            className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            aria-label="Brand color"
          />
          <span className="font-mono text-sm text-slate-500">
            {value.CompanyColors}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Plan
        </label>
        <div className="grid grid-cols-3 gap-2">
          {plans.map((plan) => {
            const selected = value.PlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onChange({ PlanId: plan.id })}
                className={`rounded-lg border p-3 text-left transition ${
                  selected
                    ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900">
                  {plan.name}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {plan.detail}
                </span>
                {plan.ai && (
                  <span className="mt-1 block text-[11px] font-semibold text-[var(--brand)]">
                    Includes AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </Button>
        <Button type="submit" loading={submitting}>
          Create account and get started
        </Button>
      </div>
    </form>
  );
}
