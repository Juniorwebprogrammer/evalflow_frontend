import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { BuildingIcon, ArrowRightIcon } from "@/shared/ui/icons";

/**
 * Asks an existing user for their company name so we can redirect them to the
 * branded login (`/login/<empresa>`), where the company — and its
 * identificationId — is resolved. We never open the plain login without it.
 */
export function CompanyLookupStep({
  value,
  onChange,
  onBack,
  onSubmit,
  error,
  submitting,
}: {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-xl font-bold text-slate-900">¿Cuál es tu empresa?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Introduce el nombre de tu empresa para acceder a su panel de
        evaluaciones.
      </p>

      <Field
        className="mt-5"
        label="Nombre de la empresa"
        icon={<BuildingIcon className="h-4 w-4" />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Clínica San Rafael"
        autoFocus
        required
      />

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
          Continuar
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
