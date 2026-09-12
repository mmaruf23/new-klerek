import { sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { dailySummary } from "../../db/schema.js";
import type { Summary } from "@packages/contract";

interface SaveDailySummaryParams {
  storeId: string;
  userId: string;
  /** tanggal transaksi dari nama file, format YYYY-MM-DD */
  dateTx: string;
  summary: Summary;
}

// Upsert rekap harian per (toko, kasir, tanggal). Upload ulang hari yang sama menimpa angka lama.
export const saveDailySummary = async ({ storeId, userId, dateTx, summary }: SaveDailySummaryParams) => {
  // NB: `summary.total_faktur` di helper sebenarnya akumulasi cash, bukan jumlah faktur
  const totalFaktur = summary.data.length;
  const memberFaktur = summary.data.filter((d) => d.member.no_member?.trim()).length;
  const totalCash = summary.data.reduce((acc, d) => acc + d.cash, 0);

  await db
    .insert(dailySummary)
    .values({
      storeId,
      userId,
      dateTx,
      totalFaktur,
      memberFaktur,
      totalCash,
    })
    .onConflictDoUpdate({
      target: [dailySummary.storeId, dailySummary.dateTx, dailySummary.userId],
      set: {
        totalFaktur,
        memberFaktur,
        totalCash,
        updatedAt: sql`now()`,
      },
    });
};
