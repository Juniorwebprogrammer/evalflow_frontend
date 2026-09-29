import type { HTMLAttributes } from "react";

/** Small inline spinner that inherits the surrounding text color. */
export function Spinner({ className = "h-4 w-4", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      {...props}
    />
  );
}
