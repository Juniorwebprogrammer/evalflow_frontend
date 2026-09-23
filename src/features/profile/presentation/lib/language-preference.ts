/**
 * Tiny client-side store for the interface language preference, backed by
 * localStorage. It is intentionally decoupled from any i18n system — for now it
 * only remembers the choice; wiring it to actual translations comes later.
 *
 * Exposed as a subscribe/getSnapshot store so components can read it with
 * `useSyncExternalStore` (SSR-safe, updates within the same tab).
 */
const STORAGE_KEY = "evalflow.language";
const listeners = new Set<() => void>();

/** Reads the stored language, or `fallback` when none/SSR. */
export function getLanguage(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(STORAGE_KEY) ?? fallback;
}

/** Persists the language and notifies subscribers in the current tab. */
export function setLanguage(value: string): void {
  window.localStorage.setItem(STORAGE_KEY, value);
  listeners.forEach((listener) => listener());
}

/** Subscribes to language changes (same tab + other tabs). Returns cleanup. */
export function subscribeLanguage(listener: () => void): () => void {
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
