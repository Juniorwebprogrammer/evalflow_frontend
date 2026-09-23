/**
 * Tiny client-side store for the sidebar collapsed/expanded preference,
 * backed by localStorage. Mirrors the pattern used for the language
 * preference — exposed as a subscribe/getSnapshot store so components can
 * read it with `useSyncExternalStore` (SSR-safe: the server snapshot is
 * always "expanded", matching first paint, and the effect-free subscribe
 * avoids a cascading render on mount).
 */
const STORAGE_KEY = "evalflow.sidebar-collapsed";
const listeners = new Set<() => void>();

/** Reads the stored preference. Always `false` on the server. */
export function isSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/** Persists the preference and notifies subscribers in the current tab. */
export function setSidebarCollapsed(value: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  listeners.forEach((listener) => listener());
}

/** Subscribes to preference changes (same tab + other tabs). Returns cleanup. */
export function subscribeSidebarCollapsed(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
