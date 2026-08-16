// src/constant.ts
var time = {
  MINUTE: 6e4,
  HOUR: 36e5,
  DAY: 864e5
};

// src/auth.ts
import { z } from "zod";
var googleAuthSchema = z.object({
  credential: z.string().min(1, "Credential wajib diisi")
});
var referStoreSchema = z.object({
  referralCode: z.string().length(6, "Kode referral harus 6 karakter").regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka")
});
var balanceAdjustSchema = z.object({
  type: z.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().max(255).optional()
});
var roleUpdateSchema = z.object({
  role: z.enum(["admin", "user"], { message: "Role harus admin atau user" })
});

// src/subscription.ts
var DAY = 86400;
var dataPrice = [
  { price: 1e3, time: 1 * DAY, name: "Harian", desc: "Sekali pakai untuk satu rekap." },
  { price: 3e3, time: 3 * DAY, bonus: 1 * DAY, name: "3 Hari", desc: "Lebih hemat dari harian." },
  { price: 5e3, time: 5 * DAY, bonus: 3 * DAY, name: "Mingguan", desc: "Cocok untuk seminggu penuh." },
  { price: 1e4, time: 10 * DAY, bonus: 8 * DAY, name: "2 Minggu", desc: "Hemat untuk dua minggu." },
  { price: 2e4, time: 20 * DAY, bonus: 20 * DAY, name: "Bulanan", desc: "Paling sering dipilih.", badge: "POPULER" },
  { price: 5e4, time: 50 * DAY, bonus: 70 * DAY, name: "4 Bulan", desc: "Untuk toko yang aktif." },
  { price: 1e5, time: 100 * DAY, bonus: 265 * DAY, name: "Tahunan", desc: "Hemat sampai 73%.", badge: "HEMAT" }
];

// src/transaction.ts
import { z as z2 } from "zod";
var dateOnly = z2.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");
var transactionQuerySchema = z2.object({
  storeId: z2.string().length(4, "Store ID harus 4 karakter").optional(),
  userId: z2.string().max(8).optional(),
  /** tanggal tunggal — kalau diisi, `from`/`to` diabaikan */
  date: dateOnly.optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  /** cari di no faktur, bill no, nama/no/telepon member, dan nama toko */
  q: z2.string().trim().min(1).max(100).optional(),
  limit: z2.coerce.number().int().min(1).max(100).default(20),
  offset: z2.coerce.number().int().min(0).default(0),
  sort: z2.enum(["newest", "oldest"]).default("newest")
}).refine((v) => !v.from || !v.to || v.from <= v.to, {
  message: "Tanggal `from` tidak boleh lebih besar dari `to`",
  path: ["from"]
});
export {
  balanceAdjustSchema,
  dataPrice,
  googleAuthSchema,
  referStoreSchema,
  roleUpdateSchema,
  time,
  transactionQuerySchema
};
