"use client";

import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/features/profile/presentation/components/user-avatar";
import { useAvatarMutations } from "@/features/profile/presentation/hooks/use-profile";
import { CameraIcon, TrashIcon, UploadIcon } from "@/shared/ui/icons";
import { Spinner } from "@/shared/ui/spinner";
import { AvatarFileError } from "@/features/profile/presentation/api/profile-client";
import { errorMessage } from "@/shared/lib/api-error";

/**
 * Profile-banner avatar with a camera button: pick a new picture (resized in
 * the browser before uploading) or remove the current one. Shows a spinner
 * over the avatar while saving and the error, if any, underneath.
 */
export function AvatarEditor({
  version,
  initials,
}: {
  version: string | null;
  initials: string;
}) {
  const { upload, remove } = useAvatarMutations();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const busy = upload.isPending || remove.isPending;
  const error = upload.error ?? remove.error;

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function pickFile() {
    setMenuOpen(false);
    upload.reset();
    remove.reset();
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires `change`.
    e.target.value = "";
    if (file) upload.mutate(file);
  }

  function handleRemove() {
    setMenuOpen(false);
    upload.reset();
    remove.mutate();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div ref={menuRef} className="relative">
        <UserAvatar
          version={version}
          initials={initials}
          className="h-20 w-20 rounded-2xl text-2xl"
          fallbackClassName="bg-white/10 text-white"
        />

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/50 text-white">
            <Spinner className="h-6 w-6" />
          </span>
        )}

        <button
          type="button"
          title="Change profile photo"
          aria-label="Change profile photo"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={busy}
          onClick={() => (version ? setMenuOpen((o) => !o) : pickFile())}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
        >
          <CameraIcon style={{ width: 14, height: 14 }} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            // Opens beside the avatar: the banner clips anything below it.
            className="absolute left-full top-0 z-20 ml-3 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-sm text-slate-700 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={pickFile}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50"
            >
              <UploadIcon className="h-4 w-4 text-slate-400" />
              Upload new photo
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleRemove}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Remove photo
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {error && (
        <p role="alert" className="max-w-[220px] text-xs text-red-300">
          {error instanceof AvatarFileError
            ? error.message
            : upload.error
              ? errorMessage(error, "We couldn't update your photo.", {
                  byDetail: [
                    [
                      "imagen no es válida",
                      "The image isn't valid. Use a JPG, PNG or WebP file.",
                    ],
                  ],
                })
              : errorMessage(error, "We couldn't remove your photo.")}
        </p>
      )}
    </div>
  );
}
