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
      <h2 className="text-xl font-bold text-slate-900">What company do you work for?</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter your company name to access its evaluation
        dashboard.
      </p>

      <Field
        className="mt-5"
        label="Company name"
        icon={<BuildingIcon className="h-4 w-4" />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="St. Raphael Clinic"
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
          Back
        </Button>
        <Button type="submit" loading={submitting}>
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
