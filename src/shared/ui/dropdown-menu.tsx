"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreVerticalIcon } from "@/shared/ui/icons";

interface DropdownMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  triggerTitle?: string;
  /** Width (and any extra styling) of the menu panel, e.g. "w-52". */
  menuClassName?: string;
}

/**
 * "..." action-menu trigger whose panel renders through a portal into
 * `document.body`, positioned by the trigger's viewport coordinates. This
 * keeps it from being clipped by an ancestor's `overflow-x-auto` — the
 * problem with rendering the panel `absolute` inside a scrollable table.
 */
export function DropdownMenu({
  open,
  onOpenChange,
  children,
  triggerTitle = "Más acciones",
  menuClassName = "w-52",
}: DropdownMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => onOpenChange(false);
    // Any scroll (including the table's own horizontal scroll) or resize
    // invalidates the position we computed — just close the menu.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title={triggerTitle}
        onClick={() => onOpenChange(!open)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>

      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
            <div
              className={`fixed z-50 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg ${menuClassName}`}
              style={{ top: position.top, right: position.right }}
            >
              {children}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
