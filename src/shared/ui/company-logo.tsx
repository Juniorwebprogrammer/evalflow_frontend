"use client";

import { useState, type ReactNode } from "react";

/**
 * Renders a company's `logoUrl` as an image, falling back to `fallback`
 * (e.g. an icon or initials badge) when there is no URL or it fails to load.
 * Pass `key={logoUrl}` from the caller so switching URLs remounts this and
 * clears any previous load failure instead of getting stuck on it.
 */
export function CompanyLogo({
  logoUrl,
  fallback,
  fallbackBackground = "var(--brand)",
  size = 36,
  rounded = "rounded-xl",
}: {
  logoUrl?: string | null;
  fallback: ReactNode;
  fallbackBackground?: string;
  size?: number;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden shadow-sm ${rounded}`}
      style={{
        width: size,
        height: size,
        background: showImage ? "#ffffff" : fallbackBackground,
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied remote URL on an arbitrary domain; next/image would need per-domain allowlisting.
        <img
          src={logoUrl!}
          alt=""
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        fallback
      )}
    </span>
  );
}
