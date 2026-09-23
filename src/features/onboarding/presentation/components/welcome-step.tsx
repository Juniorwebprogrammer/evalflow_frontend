import { Button } from "@/shared/ui/button";
import {
  ShieldIcon,
  ScaleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparkleIcon,
} from "@/shared/ui/icons";

const WELCOME_POINTS = [
  { icon: ShieldIcon, text: "Respuestas selladas hasta la revisión de RRHH" },
  { icon: ScaleIcon, text: "Análisis automático de brechas y sesgos" },
  { icon: CheckCircleIcon, text: "Mediación objetiva y trazable entre partes" },
];

export function WelcomeStep({
  onStart,
  onExistingAccount,
}: {
  onStart: () => void;
  onExistingAccount: () => void;
}) {
  return (
    <div>
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
        style={{ background: "var(--brand)" }}
      >
        <SparkleIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-slate-900">
        Bienvenido a EvalFlow
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        EvalFlow es el árbitro neutral de tus evaluaciones de desempeño. Sella
        las respuestas hasta que RRHH las revisa, pre-analiza brechas y sesgos, y
        facilita una mediación objetiva basada en datos.
      </p>

      <ul className="mt-6 space-y-3">
        {WELCOME_POINTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "color-mix(in srgb, var(--brand) 12%, white)",
                color: "var(--brand)",
              }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm text-slate-700">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-2">
        <Button onClick={onStart}>
          Crear una cuenta
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={onExistingAccount}>
          Ya tengo una cuenta
        </Button>
      </div>
    </div>
  );
}
