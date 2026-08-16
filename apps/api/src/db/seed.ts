// Bootstrap superadmin pertama.
//
// Role bersifat DB-authoritative: tidak ada whitelist env lagi. Setelah user
// login Google minimal sekali (auto-terdaftar sebagai "user"), jalankan script
// ini untuk mempromosikan email tersebut menjadi superadmin. Selanjutnya
// superadmin bisa mengelola role user lain lewat panel.
//
// Cara pakai:
//   pnpm --filter api exec tsx ./src/db/seed.ts <email>
//   atau: BOOTSTRAP_SUPERADMIN_EMAIL=you@mail.com pnpm --filter api exec tsx ./src/db/seed.ts

import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { users } from "./schema.js";

async function main() {
  const email = (process.argv[2] ?? process.env.BOOTSTRAP_SUPERADMIN_EMAIL ?? "").trim().toLowerCase();

  if (!email) {
    console.error("Email wajib diisi.");
    console.error("Contoh: pnpm --filter api exec tsx ./src/db/seed.ts you@mail.com");
    process.exit(1);
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user) {
    console.error(`User dengan email "${email}" tidak ditemukan.`);
    console.error("Pastikan user sudah login via Google minimal sekali sebelum di-promote.");
    process.exit(1);
  }

  if (user.role === "superadmin") {
    console.log(`User "${email}" sudah superadmin. Tidak ada perubahan.`);
    process.exit(0);
  }

  await db
    .update(users)
    .set({ role: "superadmin", updatedAt: new Date() })
    .where(eq(users.id, user.id));

  console.log(`✅ ${email} sekarang superadmin (sebelumnya: ${user.role}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
