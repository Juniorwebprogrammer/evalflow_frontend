/** Whether `date` is already in the past relative to now. Invalid/empty dates are treated as not past. */
export function isPast(date: string | Date): boolean {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return false;
  return value.getTime() < Date.now();
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** Formats `date` as a short relative string ("hace 2h", "hace 3 días"...). */
export function formatRelativeTime(date: string | Date): string {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const seconds = Math.round((value.getTime() - Date.now()) / 1000);

  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return relativeTimeFormatter.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return relativeTimeFormatter.format(seconds, "second");
}
