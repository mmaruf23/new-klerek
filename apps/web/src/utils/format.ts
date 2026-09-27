const LOCALE = "id-ID";

const rupiahFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 15000 → "Rp 15.000" */
export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount);
}

/**
 * Tanggal lokal Indonesia.
 * - "long"  → "5 Januari 2026"
 * - "short" → "5 Jan 2026"
 */
export function formatDate(date: Date | string, month: "long" | "short" = "long"): string {
  return new Date(date).toLocaleDateString(LOCALE, { day: "numeric", month, year: "numeric" });
}

/** "5 Januari 2026 · Senin". String tanggal tidak valid dikembalikan apa adanya. */
export function formatDateWithDay(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const day = d.toLocaleDateString(LOCALE, { weekday: "long" });
  return `${formatDate(d)} · ${day}`;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/**
 * Waktu relatif dua arah:
 * masa lalu → "3 hari yang lalu" / "kemarin", masa depan → "dalam 5 hari" / "besok".
 */
export function timeAgo(date: Date | string): string {
  const diff = new Date(date).getTime() - Date.now();
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) return relativeFormatter.format(Math.round(diff / ms), unit);
  }
  return diff < 0 ? "baru saja" : "sebentar lagi";
}
