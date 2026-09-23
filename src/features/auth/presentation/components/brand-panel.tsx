import { Logo } from "@/shared/ui/logo";
import {
  ShieldIcon,
  ScaleIcon,
  CheckCircleIcon,
} from "@/shared/ui/icons";

const FEATURES = [
  { icon: ShieldIcon, text: "Respuestas selladas hasta revisión de RRHH" },
  { icon: ScaleIcon, text: "Pre-análisis automático de brechas y sesgos" },
  { icon: CheckCircleIcon, text: "Cumplimiento regulatorio para entidades sanitarias" },
];

/** The dark hero panel shown on the left of the auth screen. */
export function BrandPanel({
  companyName,
  logoUrl,
}: {
  companyName?: string;
  logoUrl?: string | null;
}) {
  return (
    <div
      className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between"
      style={{
        background:
          "linear-gradient(150deg, var(--panel-from) 0%, var(--panel-to) 100%)",
      }}
    >
      {/* concentric radar rings */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[820px] w-[820px] -translate-y-1/2 rounded-full opacity-[0.06]"
        style={{
          background:
            "repeating-radial-gradient(circle, #ffffff 0 1px, transparent 1px 90px)",
        }}
      />

      <div className="relative z-10">
        <Logo label={companyName} logoUrl={logoUrl} />
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="text-4xl font-bold leading-tight text-white">
          Evaluaciones sin sesgos.
          <br />
          Decisiones con datos.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-slate-300">
          El árbitro neutral que tu organización necesita. Protocolos sellados,
          análisis comparativo y mediación objetiva por RRHH.
        </p>
      </div>

      <ul className="relative z-10 space-y-4">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3 text-slate-300">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Icon className="h-4 w-4" style={{ color: "var(--brand-soft)" }} />
            </span>
            <span className="text-sm">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
