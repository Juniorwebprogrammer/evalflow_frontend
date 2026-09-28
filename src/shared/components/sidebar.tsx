"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/features/profile/domain/profile";
import { Logo } from "@/shared/ui/logo";
import { Spinner } from "@/shared/ui/spinner";
import { LogoutIcon, ChevronLeftIcon } from "@/shared/ui/icons";
import { NavPendingIndicator, useShellNav } from "@/shared/components/nav";
import {
  isSidebarCollapsed,
  setSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/shared/lib/sidebar-preference";

/** Desktop (lg+) side navigation. Hidden on smaller screens — see `MobileNav`. */
export function Sidebar({ initialProfile }: { initialProfile: Profile }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    isSidebarCollapsed,
    () => false,
  );
  const { userName, initials, nav, signingOut, signOut } = useShellNav(initialProfile);

  function toggleCollapsed() {
    setSidebarCollapsed(!collapsed);
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col text-slate-300 lg:flex transition-[width] duration-200 ${
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          const className = `flex w-full items-center rounded-lg text-sm font-medium transition ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-[var(--brand)] text-white shadow-sm"
              : "text-slate-300 hover:bg-white/5"
          }`;
          return (
            <Link key={label} href={href} title={label} className={className}>
              <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && <NavPendingIndicator />}
            </Link>
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
          onClick={signOut}
          className="text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          {signingOut ? (
            <Spinner className="h-[18px] w-[18px]" />
          ) : (
            <LogoutIcon style={{ width: 18, height: 18 }} />
          )}
        </button>
      </div>
    </aside>
  );
}
