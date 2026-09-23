"use client";

import type { ReactNode } from "react";
import { XIcon } from "@/shared/ui/icons";

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

interface ModalProps {
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: keyof typeof SIZE_CLASS;
  /** Disables the close button and backdrop click, e.g. while a request is in flight. */
  disableClose?: boolean;
}

/**
 * Generic centered modal: dimmed backdrop + white card. Closes on backdrop
 * click or the corner button unless `disableClose` is set.
 */
export function Modal({
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
  disableClose = false,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={disableClose ? undefined : onClose}
      />

      <div
        className={`relative z-10 w-full ${SIZE_CLASS[size]} max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
                {icon}
              </span>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disableClose}
            className="shrink-0 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
