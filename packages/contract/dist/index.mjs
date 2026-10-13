// src/constant.ts
var time = {
  MINUTE: 6e4,
  HOUR: 36e5,
  DAY: 864e5
};

// src/auth.ts
import { z } from "zod";
var loginAuthSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(1, "Password wajib diisi")
});
var googleAuthSchema = z.object({
  credential: z.string().min(1, "Credential wajib diisi")
});
var referStoreSchema = z.object({
  referralCode: z.string().length(6, "Kode referral harus 6 karakter").regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka")
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

// src/payment.ts
import { z as z2 } from "zod";
var generatePaymentSchema = z2.object({
  storeId: z2.string().length(4, "ID toko harus 4 karakter").regex(/^[A-Z0-9]+$/, "ID toko hanya huruf kapital dan angka"),
  packageIndex: z2.number({ message: "packageIndex harus angka" }).int().min(0, "Paket tidak valid").max(dataPrice.length - 1, "Paket tidak valid"),
  email: z2.email("Email tidak valid").max(100, "Email terlalu panjang")
});

// src/balance.ts
import z3 from "zod";
var balanceAdjustSchema = z3.object({
  type: z3.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: z3.number().int().positive("Jumlah harus lebih dari 0"),
  note: z3.string().max(255).optional()
});

// src/user.ts
import z4 from "zod";
var roleUpdateSchema = z4.object({
  role: z4.enum(["admin", "user"], { message: "Role harus admin atau user" })
});
var createUserSchema = z4.object({
  name: z4.string().min(3),
  username: z4.string().min(3),
  password: z4.string().min(3),
  email: z4.email(),
  role: z4.enum(["admin", "user"], { message: "Role harus admin atau user" })
});
export {
  balanceAdjustSchema,
  createUserSchema,
  dataPrice,
  generatePaymentSchema,
  googleAuthSchema,
  loginAuthSchema,
  referStoreSchema,
  roleUpdateSchema,
  time
};
