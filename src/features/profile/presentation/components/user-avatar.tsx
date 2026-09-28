"use client";

import { useState } from "react";
import { avatarUrl } from "@/features/profile/presentation/api/profile-client";

/**
 * The signed-in user's profile picture, or their initials when they have
 * none (or it fails to load). `version` is the profile's `avatarUpdatedAt`:
 * a new value means a new image URL, and remounting via `key` clears any
 * earlier load failure.
 */
export function UserAvatar({
  version,
  initials,
  className = "h-9 w-9 rounded-full text-xs",
  fallbackClassName = "bg-[var(--brand)] text-white",
}: {
  version: string | null;
  initials: string;
  /** Size, shape and font size, e.g. "h-20 w-20 rounded-2xl text-2xl". */
  className?: string;
  /** Background / text color of the initials fallback. */
  fallbackClassName?: string;
}) {
  return <AvatarImage key={version ?? "none"} version={version} initials={initials} className={className} fallbackClassName={fallbackClassName} />;
}

function AvatarImage({
  version,
  initials,
  className,
  fallbackClassName,
}: {
  version: string | null;
  initials: string;
  className: string;
  fallbackClassName: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = version !== null && !failed;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden font-bold ${className} ${
        showImage ? "bg-slate-200" : fallbackClassName
      }`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- served by our own route handler with a session cookie; next/image optimization doesn't apply.
        <img
          src={avatarUrl(version)}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
