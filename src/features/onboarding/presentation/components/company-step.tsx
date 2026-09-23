import { Field } from "@/shared/ui/field";
import { Select } from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BuildingIcon, DocIcon, MapPinIcon } from "@/shared/ui/icons";
import type { CompanyData } from "@/features/onboarding/presentation/components/types";
import { SECTORS } from "@/shared/data/sectors";

const PLANS = [
  { id: 1, name: "Starter", detail: "Hasta 25 empleados" },
  { id: 2, name: "Growth", detail: "Hasta 100 empleados" },
  { id: 3, name: "Enterprise", detail: "Empleados ilimitados" },
];

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
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-xl font-bold text-slate-900">Tu empresa</h2>
      <p className="mt-1 text-sm text-slate-500">
        Configura la organización que vas a evaluar.
      </p>

      <Field
        className="mt-5"
        label="Nombre de la empresa"
        icon={<BuildingIcon className="h-4 w-4" />}
        value={value.CompanyNombre}
        onChange={(e) => onChange({ CompanyNombre: e.target.value })}
        placeholder="Clínica San Rafael"
        required
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field
          label="CIF / NIF"
          icon={<DocIcon className="h-4 w-4" />}
          value={value.Cif}
          onChange={(e) => onChange({ Cif: e.target.value })}
          placeholder="B-12345678"
          required
        />
        <Select
          label="Sector"
          options={SECTORS.map((s) => ({ value: s, label: s }))}
          value={value.Sector}
          onChange={(e) => onChange({ Sector: e.target.value })}
        />
      </div>

      <Field
        className="mt-3"
        label="Dirección fiscal"
        icon={<MapPinIcon className="h-4 w-4" />}
        value={value.DireccionFiscal}
        onChange={(e) => onChange({ DireccionFiscal: e.target.value })}
        placeholder="Calle Mayor 45, 28001 Madrid"
        required
      />

      <div className="mt-3">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Color de marca
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value.CompanyColors}
            onChange={(e) => onChange({ CompanyColors: e.target.value })}
            className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            aria-label="Color de marca"
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
          {PLANS.map((plan) => {
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
          Atrás
        </Button>
        <Button type="submit" loading={submitting}>
          Crear cuenta y empezar
        </Button>
      </div>
    </form>
  );
}
