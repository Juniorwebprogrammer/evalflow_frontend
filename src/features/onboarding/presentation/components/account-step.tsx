import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { Notice } from "@/shared/ui/notice";
import { UserIcon, MailIcon, LockIcon, ArrowRightIcon } from "@/shared/ui/icons";
import type { AccountData } from "@/features/onboarding/presentation/components/types";

export function AccountStep({
  value,
  onChange,
  onBack,
  onSubmit,
  error,
}: {
  value: AccountData;
  onChange: (patch: Partial<AccountData>) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-xl font-bold text-slate-900">Tu cuenta</h2>
      <p className="mt-1 text-sm text-slate-500">
        Empecemos con tus datos personales.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Field
          label="Nombre"
          icon={<UserIcon className="h-4 w-4" />}
          value={value.UserNombre}
          onChange={(e) => onChange({ UserNombre: e.target.value })}
          placeholder="Ana"
          required
        />
        <Field
          label="Apellidos"
          value={value.Apellidos}
          onChange={(e) => onChange({ Apellidos: e.target.value })}
          placeholder="García"
          required
        />
      </div>
      <Field
        className="mt-3"
        label="Correo electrónico"
        type="email"
        icon={<MailIcon className="h-4 w-4" />}
        value={value.Email}
        onChange={(e) => onChange({ Email: e.target.value })}
        placeholder="ana.garcia@empresa.es"
        required
      />
      <Field
        className="mt-3"
        label="Contraseña"
        type="password"
        icon={<LockIcon className="h-4 w-4" />}
        value={value.Password}
        onChange={(e) => onChange({ Password: e.target.value })}
        placeholder="Mínimo 8 caracteres"
        minLength={8}
        required
      />

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit">
          Continuar
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
