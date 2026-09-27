import type { StoreResponse } from "@packages/contract";
import { formatDate, formatRupiah, timeAgo } from "@/utils/format";

type Subs = StoreResponse["subs"];

// ── Paket (dataPrice: time & bonus dalam detik) ──────────────────────────────

/** Total hari sebuah paket, termasuk bonus. */
export function packageDays(time: number, bonus = 0): number {
  return Math.round((time + bonus) / 86_400);
}

/** 2_592_000 → "1 Bulan", 604_800 → "7 Hari" */
export function formatPackageDuration(time: number, bonus = 0): string {
  const days = packageDays(time, bonus);
  if (days >= 365) return `${Math.round(days / 365)} Tahun`;
  if (days >= 30) return `${Math.round(days / 30)} Bulan`;
  return `${days} Hari`;
}

/** "setara Rp 1.000/hari" */
export function formatPerDayPrice(price: number, time: number, bonus = 0): string {
  return `setara ${formatRupiah(Math.round(price / packageDays(time, bonus)))}/hari`;
}

/** "5 Jan 2026 – 4 Feb 2026" — rentang aktif jika paket dibeli hari ini. */
export function formatProjectedRange(totalDays: number): string {
  const start = new Date();
  const end = new Date(start.getTime() + totalDays * 86_400_000);
  return `${formatDate(start, "short")} – ${formatDate(end, "short")}`;
}

// ── Status subscription toko ────────────────────────────────────────────────

export type SubStatus = "aktif" | "trial" | "habis";

export function getActiveSub(subs: Subs) {
  const now = new Date();
  return subs?.find((s) => new Date(s.expiresAt) > now);
}

export function getSubStatus(subs: Subs): SubStatus {
  const active = getActiveSub(subs);
  if (!active) return "habis";
  return active.isTrial ? "trial" : "aktif";
}

/** Label jenis paket aktif berdasarkan durasinya: "Trial", "Bulanan", …, atau "Habis". */
export function getSubLabel(subs: Subs): string {
  const active = getActiveSub(subs);
  if (!active) return "Habis";
  const duration = new Date(active.expiresAt).getTime() - new Date(active.createdAt).getTime();
  const days = Math.round(duration / 86_400_000);
  if (days <= 7) return "Trial";
  if (days <= 31) return "Bulanan";
  if (days <= 93) return "3 Bulan";
  if (days <= 186) return "6 Bulan";
  return "Tahunan";
}

/** "Aktif hingga 5 Jan 2026" atau "Tidak aktif" */
export function formatActiveUntil(subs: Subs): string {
  const active = getActiveSub(subs);
  if (!active) return "Tidak aktif";
  return `Aktif hingga ${formatDate(active.expiresAt, "short")}`;
}

/** "berakhir dalam 5 hari" / "habis 3 hari yang lalu" / "belum ada langganan" */
export function formatExpiryRelative(subs: Subs): string {
  // API /store hanya mengirim subscription dengan expiresAt paling akhir
  const latest = subs?.[0];
  if (!latest) return "belum ada langganan";
  const expired = new Date(latest.expiresAt) <= new Date();
  return `${expired ? "habis" : "berakhir"} ${timeAgo(latest.expiresAt)}`;
}
