import type { Profile } from "@/features/profile/domain/profile";
import {
  CrownIcon,
  MailIcon,
  BuildingIcon,
  CheckCircleIcon,
} from "@/shared/ui/icons";
import { EXAMPLE_PROFILE } from "@/features/profile/presentation/data/example";
import { AvatarEditor } from "@/features/profile/presentation/components/avatar-editor";

function initials(nombre: string, apellidos: string) {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || "U";
}

/** Formats an ISO date as e.g. "Enero 2023". */
function memberSince(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const formatted = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** The dark banner at the top of the profile screen. */
export function ProfileHeader({ profile }: { profile: Profile }) {
  const fullName = `${profile.nombre} ${profile.apellidos}`.trim();

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-6 text-white sm:px-8 sm:py-7"
      style={{
        background:
          "linear-gradient(120deg, var(--panel-from) 0%, var(--panel-to) 100%)",
      }}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:gap-5">
          <AvatarEditor
            version={profile.avatarUpdatedAt}
            initials={initials(profile.nombre, profile.apellidos)}
          />

          <div className="min-w-0 pt-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-xl font-bold sm:text-2xl">{fullName || "Usuario"}</h1>
              {profile.rol && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  <CrownIcon style={{ width: 13, height: 13 }} />
                  {profile.rol}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-300">
              <span className="inline-flex min-w-0 items-center gap-1.5 break-all">
                <MailIcon style={{ width: 14, height: 14 }} />
                {profile.email}
              </span>
              {profile.nombreEmpresa && (
                <span className="inline-flex items-center gap-1.5">
                  <BuildingIcon style={{ width: 14, height: 14 }} />
                  {profile.nombreEmpresa}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <CheckCircleIcon style={{ width: 14, height: 14 }} />
                Cuenta verificada
              </span>
            </div>
          </div>
        </div>

        <div className="hidden text-right text-xs text-slate-400 sm:block">
          <p className="tracking-widest">MIEMBRO DESDE</p>
          <p className="mt-0.5 text-base font-semibold text-white">
            {memberSince(profile.fechaCreacion)}
          </p>
          <p className="mt-2 text-slate-400">
            Último acceso: {EXAMPLE_PROFILE.lastAccess}
          </p>
        </div>
      </div>
    </div>
  );
}
