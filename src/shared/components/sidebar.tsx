"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/features/profile/domain/profile";
import { useProfile } from "@/features/profile/presentation/hooks/use-profile";
import { initials as toInitials } from "@/features/team/presentation/lib/format";
import { Logo } from "@/shared/ui/logo";
import {
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  BarsIcon,
  SettingsIcon,
  DocIcon,
  StarIcon,
  LogoutIcon,
  ChevronLeftIcon,
  MailIcon,
} from "@/shared/ui/icons";
import { logout } from "@/app/dashboard/actions";
import {
  isSidebarCollapsed,
  setSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/shared/lib/sidebar-preference";

const NAV = [
  { icon: GridIcon, label: "Dashboard", href: "/dashboard" },
  { icon: DocIcon, label: "Plantillas", href: "/dashboard/plantillas" },
  { icon: ClipboardIcon, label: "Ciclos de evaluación", href: "/dashboard/ciclos-evaluacion" },
  { icon: StarIcon, label: "Listas favoritas", href: "/dashboard/listas-favoritas" },
  { icon: UsersIcon, label: "Empleados", href: "/dashboard/usuarios" },
  { icon: BarsIcon, label: "Mis evaluaciones", href: "/dashboard/mis-evaluaciones" },
  { icon: MailIcon, label: "Solicitudes de información", href: "/dashboard/solicitudes-informacion" },
  { icon: SettingsIcon, label: "Configuración" },
];

export function Sidebar({ initialProfile }: { initialProfile: Profile }) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    isSidebarCollapsed,
    () => false,
  );
  // Shares the `["profile"]` query cache with the Perfil page — editing your
  // name there updates this instantly, everywhere the shell is mounted.
  const { data: profile } = useProfile(initialProfile);

  function toggleCollapsed() {
    setSidebarCollapsed(!collapsed);
  }

  const userName = `${profile.nombre} ${profile.apellidos}`.trim() || "Usuario";
  const initials = toInitials(profile.nombre, profile.apellidos);

  return (
    <aside
      className={`relative flex shrink-0 flex-col text-slate-300 transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
      style={{
        background:
          "linear-gradient(180deg, var(--panel-from) 0%, var(--panel-to) 100%)",
      }}
    >
      <button
        type="button"
        title={collapsed ? "Expandir menú" : "Contraer menú"}
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-700"
      >
        <ChevronLeftIcon
          className="h-3.5 w-3.5"
          style={{ transform: collapsed ? "rotate(180deg)" : undefined }}
        />
      </button>

      <div className="border-b border-white/10 px-5 py-5">
        <Logo compact={collapsed} />
        {!collapsed && (
          <p className="mt-2 text-[11px] font-semibold tracking-widest text-slate-400">
            PANEL RRHH
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ icon: Icon, label, href }) => {
          const active = href ? pathname === href : false;
          const className = `flex w-full items-center rounded-lg text-sm font-medium transition ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-[var(--brand)] text-white shadow-sm"
              : "text-slate-300 hover:bg-white/5"
          }`;
          const content = (
            <>
              <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              {!collapsed && label}
            </>
          );
          return href ? (
            <Link key={label} href={href} title={label} className={className}>
              {content}
            </Link>
          ) : (
            <button key={label} title={label} className={className}>
              {content}
            </button>
          );
        })}
      </nav>

      <div
        className={`flex items-center border-t border-white/10 px-4 py-4 ${
          collapsed ? "flex-col gap-3" : "gap-3"
        }`}
      >
        <Link
          href="/dashboard/perfil"
          title="Ver perfil"
          className={`flex min-w-0 items-center gap-3 rounded-lg p-1 transition hover:bg-white/5 ${
            collapsed ? "" : "flex-1"
          }`}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--brand)" }}
          >
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="truncate text-xs text-slate-400">Ver perfil</p>
            </div>
          )}
        </Link>
        <button
          title="Cerrar sesión"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            logout();
          }}
          className="text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          <LogoutIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </aside>
  );
}
