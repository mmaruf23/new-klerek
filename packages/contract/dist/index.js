"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  balanceAdjustSchema: () => balanceAdjustSchema,
  createUserSchema: () => createUserSchema,
  dataPrice: () => dataPrice,
  generatePaymentSchema: () => generatePaymentSchema,
  googleAuthSchema: () => googleAuthSchema,
  loginAuthSchema: () => loginAuthSchema,
  referStoreSchema: () => referStoreSchema,
  roleUpdateSchema: () => roleUpdateSchema,
  time: () => time
});
module.exports = __toCommonJS(index_exports);

// src/constant.ts
var time = {
  MINUTE: 6e4,
  HOUR: 36e5,
  DAY: 864e5
};

// src/auth.ts
var import_zod = require("zod");
var loginAuthSchema = import_zod.z.object({
  username: import_zod.z.string().min(3, "Username minimal 3 karakter"),
  password: import_zod.z.string().min(1, "Password wajib diisi")
});
var googleAuthSchema = import_zod.z.object({
  credential: import_zod.z.string().min(1, "Credential wajib diisi")
});
var referStoreSchema = import_zod.z.object({
  referralCode: import_zod.z.string().length(6, "Kode referral harus 6 karakter").regex(/^[A-Z0-9]+$/, "Kode referral hanya huruf kapital dan angka")
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
var import_zod2 = require("zod");
var generatePaymentSchema = import_zod2.z.object({
  storeId: import_zod2.z.string().length(4, "ID toko harus 4 karakter").regex(/^[A-Z0-9]+$/, "ID toko hanya huruf kapital dan angka"),
  packageIndex: import_zod2.z.number({ message: "packageIndex harus angka" }).int().min(0, "Paket tidak valid").max(dataPrice.length - 1, "Paket tidak valid"),
  email: import_zod2.z.email("Email tidak valid").max(100, "Email terlalu panjang")
});

// src/balance.ts
var import_zod3 = __toESM(require("zod"));
var balanceAdjustSchema = import_zod3.default.object({
  type: import_zod3.default.enum(["credit", "debit"], { message: "Tipe harus credit atau debit" }),
  amount: import_zod3.default.number().int().positive("Jumlah harus lebih dari 0"),
  note: import_zod3.default.string().max(255).optional()
});

// src/user.ts
var import_zod4 = __toESM(require("zod"));
var roleUpdateSchema = import_zod4.default.object({
  role: import_zod4.default.enum(["admin", "user"], { message: "Role harus admin atau user" })
});
var createUserSchema = import_zod4.default.object({
  name: import_zod4.default.string().min(3),
  username: import_zod4.default.string().min(3),
  password: import_zod4.default.string().min(3),
  email: import_zod4.default.email(),
  role: import_zod4.default.enum(["admin", "user"], { message: "Role harus admin atau user" })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  balanceAdjustSchema,
  createUserSchema,
  dataPrice,
  generatePaymentSchema,
  googleAuthSchema,
  loginAuthSchema,
  referStoreSchema,
  roleUpdateSchema,
  time
});
