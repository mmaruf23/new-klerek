"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  dataPrice: () => dataPrice,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
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
var loginSchema = import_zod.z.object({
  username: import_zod.z.string().min(3, "Username wajib diisi"),
  password: import_zod.z.string().min(6, "Password wajib diisi")
});
var registerSchema = import_zod.z.object({
  name: import_zod.z.string().min(1, "Nama wajib diisi").max(255),
  username: import_zod.z.string().min(3, "Username minimal 3 karakter").max(50),
  password: import_zod.z.string().min(6, "Password minimal 6 karakter")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dataPrice,
  loginSchema,
  registerSchema,
  time
});
