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
export {
  balanceAdjustSchema,
  dataPrice,
  googleAuthSchema,
  referStoreSchema,
  roleUpdateSchema,
  time
};
