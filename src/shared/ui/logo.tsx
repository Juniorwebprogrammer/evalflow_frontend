import { CompanyLogo } from "@/shared/ui/company-logo";
import { ShieldIcon } from "@/shared/ui/icons";

export function Logo({
  compact = false,
  label,
  logoUrl,
}: {
  compact?: boolean;
  label?: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <CompanyLogo
        key={logoUrl ?? "none"}
        logoUrl={logoUrl}
        size={36}
        fallback={<ShieldIcon className="h-5 w-5 text-white" />}
      />
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-white">
          {label ? (
            label
          ) : (
            <>
              eval<span style={{ color: "var(--brand-soft)" }}>flow</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
