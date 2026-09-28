"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/features/profile/domain/profile";
import { Logo } from "@/shared/ui/logo";
import { Spinner } from "@/shared/ui/spinner";
import { LogoutIcon, MenuIcon, XIcon } from "@/shared/ui/icons";
import { NavPendingIndicator, useShellNav } from "@/shared/components/nav";

/**
 * Mobile/tablet (< lg) navigation: a sticky top bar with the logo and a menu
 * button that drops the nav down over the page, so screens get the full
 * width instead of sharing it with the sidebar.
 */
export function MobileNav({ initialProfile }: { initialProfile: Profile }) {
  const pathname = usePathname();
  // The path the menu was opened on — it closes itself once a navigation
  // lands on another screen.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);
  const { userName, initials, nav, signingOut, signOut } = useShellNav(initialProfile);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    // Keep the page behind the menu from scrolling.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panelStyle = {
    background: "linear-gradient(180deg, var(--panel-from) 0%, var(--panel-to) 100%)",
  };

  return (
    <div className="sticky top-0 z-40 lg:hidden">
      <header
        className="flex h-14 items-center justify-between px-4 text-slate-300"
        style={panelStyle}
      >
        <Link href="/dashboard" aria-label="Ir al dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="-mr-2 rounded-lg p-2 text-slate-200 transition hover:bg-white/10"
        >
          {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 bg-slate-900/50"
            onClick={close}
          />
          <div
            id="mobile-nav-menu"
            className="absolute inset-x-0 top-14 flex max-h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto border-t border-white/10 text-slate-300 shadow-2xl"
            style={panelStyle}
          >
            <nav className="space-y-1 px-3 py-3">
              {nav.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => href === pathname && close()}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    pathname === href
                      ? "bg-[var(--brand)] text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="shrink-0" style={{ width: 18, height: 18 }} />
                  <span className="flex-1">{label}</span>
                  <NavPendingIndicator />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
              <Link
                href="/dashboard/perfil"
                onClick={() => pathname === "/dashboard/perfil" && close()}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 transition hover:bg-white/5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--brand)" }}
                >
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{userName}</p>
                  <p className="truncate text-xs text-slate-400">Ver perfil</p>
                </div>
              </Link>
              <button
                type="button"
                disabled={signingOut}
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                {signingOut ? (
                  <Spinner className="h-[18px] w-[18px]" />
                ) : (
                  <LogoutIcon style={{ width: 18, height: 18 }} />
                )}
                Salir
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
