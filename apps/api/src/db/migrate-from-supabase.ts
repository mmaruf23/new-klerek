// Migrasi data lama (Supabase) -> database baru (Neon).
//
// Dipakai sekali saat cutover dari aplikasi lama (next-klerek) ke aplikasi ini.
// Aman dijalankan berkali-kali: selama aplikasi lama masih hidup, script ini
// bisa diulang untuk menyusul data yang masuk belakangan.
//
// Yang dipindah:
//   store        116 baris  -> store        (referrer_id dikosongkan)
//   subscription 470 baris  -> subscription (subs_type -> is_trial)
//   transaction     TIDAK dipindah, hanya dibaca untuk mengisi store.branch_id
//
// Neon dianggap sumber kebenaran: baris yang sudah ada di Neon tidak pernah
// ditimpa. Satu-satunya pengecualian adalah branch_id yang masih kosong —
// itu diisi dari data lama, tidak menimpa nilai yang sudah ada.
//
// Cara pakai (dari root repo):
//   # 1. lihat dulu apa yang akan terjadi, tidak menulis apa pun
//   pnpm --filter api exec tsx ./src/db/migrate-from-supabase.ts
//
//   # 2. hapus data dummy di Neon lalu migrasi beneran
//   pnpm --filter api exec tsx ./src/db/migrate-from-supabase.ts --wipe --execute
//
//   # 3. saat cutover final, susulkan data yang masuk sejak run pertama
//   pnpm --filter api exec tsx ./src/db/migrate-from-supabase.ts --execute
//
// Butuh dua env var di apps/api/.env :
//   DATABASE_URL           -> Neon (tujuan)
//   SUPABASE_DATABASE_URL  -> Supabase (sumber, boleh dihapus setelah selesai)

import "dotenv/config";
import { Pool } from "pg";

const DRY_RUN = !process.argv.includes("--execute");
const WIPE = process.argv.includes("--wipe");

// Skema lama menyimpan store.created_at dengan default
// `now() AT TIME ZONE 'Asia/Jakarta'` ke dalam kolom timestamptz — wall clock
// Jakarta ditulis seolah-olah UTC, jadi semua nilainya maju 7 jam. Diverifikasi
// dengan membandingkan ke subscription.created_at (defaultnya benar, pakai
// 'utc'): selisihnya persis 7 jam di seluruh baris.
//
// subscription.created_at dan expired_at TIDAK kena bug ini, disalin apa adanya.
const STORE_CLOCK_SKEW = "7 hours";

interface SourceStore {
  id: string;
  name: string;
  created_at: string;
}

interface SourceSubscription {
  store_id: string;
  subs_type: string | null;
  created_at: string;
  expired_at: string;
}

interface SourceBranch {
  store_id: string;
  branch_id: string;
}

const need = (key: string): string => {
  const v = process.env[key];
  if (!v) {
    console.error(`Env ${key} belum diisi. Lihat komentar di atas file ini.`);
    process.exit(1);
  }
  return v;
};

const trunc = (v: string, max: number): string => (v.length > max ? v.slice(0, max) : v);

async function main() {
  const source = new Pool({ connectionString: need("SUPABASE_DATABASE_URL"), max: 1 });
  const target = new Pool({ connectionString: need("DATABASE_URL"), max: 1 });

  console.log(DRY_RUN ? "MODE: dry-run (tidak ada yang ditulis)\n" : "MODE: execute\n");

  // -------------------------------------------------------------------------
  // Baca sumber
  // -------------------------------------------------------------------------
  const { rows: stores } = await source.query<SourceStore>(
    `SELECT id, name, created_at::text FROM store ORDER BY created_at`,
  );

  const { rows: subs } = await source.query<SourceSubscription>(
    `SELECT store_id, subs_type::text, created_at::text, expired_at::text
     FROM subscription ORDER BY created_at`,
  );

  // transaction lama tidak dimigrasi — dibaca hanya untuk mengambil branch_id
  // terakhir yang diketahui per toko (24 toko tercatat pernah ganti branch).
  const { rows: branches } = await source.query<SourceBranch>(
    `SELECT DISTINCT ON (store_id) store_id, branch_id
     FROM transaction ORDER BY store_id, created_at DESC, id DESC`,
  );

  const branchOf = new Map(branches.map((b) => [b.store_id, b.branch_id]));

  console.log(`Sumber : ${stores.length} store, ${subs.length} subscription, ${branchOf.size} branch_id`);

  // -------------------------------------------------------------------------
  // Tulis ke tujuan, semuanya dalam satu transaksi
  // -------------------------------------------------------------------------
  const client = await target.connect();
  try {
    await client.query("BEGIN");

    if (WIPE) {
      // users sengaja TIDAK ikut: itu akun Google asli beserta role dan
      // referal_code-nya. Tidak ada tabel di bawah yang direferensikan users,
      // jadi CASCADE tidak akan menyentuhnya.
      await client.query(
        `TRUNCATE transaction, payment, balance, subscription, store RESTART IDENTITY CASCADE`,
      );
      console.log("Dummy di Neon dihapus (users dipertahankan).");
    }

    // --- store --------------------------------------------------------------
    // Nilai waktu sengaja dikirim sebagai teks lalu di-cast eksplisit di SQL.
    // Kalau Date object dikirim langsung, node-pg menuliskannya memakai zona
    // waktu mesin yang menjalankan script — di laptop WIB itu bikin geser 7 jam.
    let storeInserted = 0;
    let branchFilled = 0;

    for (const s of stores) {
      const res = await client.query(
        `INSERT INTO store (id, name, branch_id, created_at, referrer_id)
         VALUES ($1, $2, $3, ($4::timestamptz - $5::interval) AT TIME ZONE 'UTC', NULL)
         ON CONFLICT (id) DO UPDATE
           SET branch_id = COALESCE(store.branch_id, EXCLUDED.branch_id)
         RETURNING (xmax = 0) AS is_baru, branch_id`,
        [
          trunc(s.id, 4),
          trunc(s.name, 255),
          branchOf.get(s.id)?.slice(0, 4) ?? null,
          s.created_at,
          STORE_CLOCK_SKEW,
        ],
      );
      if (res.rows[0].is_baru) storeInserted++;
      else if (res.rows[0].branch_id) branchFilled++;
    }

    // --- subscription -------------------------------------------------------
    // Tabel ini tidak punya unique constraint, jadi idempotensinya dijaga
    // manual lewat anti-join (store_id, expires_at). Kolom id di Neon
    // GENERATED ALWAYS, jadi id lama memang tidak dibawa — tidak ada yang
    // mereferensikannya.
    let subsInserted = 0;

    for (const sub of subs) {
      const res = await client.query(
        `INSERT INTO subscription (store_id, is_trial, created_at, expires_at)
         SELECT $1::varchar(4), $2::boolean,
                $3::timestamptz AT TIME ZONE 'UTC', $4::timestamptz AT TIME ZONE 'UTC'
         WHERE EXISTS (SELECT 1 FROM store WHERE id = $1::varchar(4))
           AND NOT EXISTS (
             SELECT 1 FROM subscription
             WHERE store_id = $1::varchar(4)
               AND expires_at = $4::timestamptz AT TIME ZONE 'UTC'
           )`,
        [sub.store_id, sub.subs_type === "trial", sub.created_at, sub.expired_at],
      );
      subsInserted += res.rowCount ?? 0;
    }

    // --- laporan ------------------------------------------------------------
    const { rows: after } = await client.query<{ t: string; n: string }>(
      `SELECT 'store' t, count(*)::text n FROM store
       UNION ALL SELECT 'subscription', count(*)::text FROM subscription
       UNION ALL SELECT 'store tanpa branch_id', count(*)::text FROM store WHERE branch_id IS NULL
       UNION ALL SELECT 'subscription aktif', count(*)::text FROM subscription WHERE expires_at >= now()`,
    );

    console.log("\nHasil:");
    console.log(`  store baru           : ${storeInserted}`);
    console.log(`  store dilewati       : ${stores.length - storeInserted} (sudah ada di Neon)`);
    console.log(`  branch_id terisi     : ${branchFilled}`);
    console.log(`  subscription baru    : ${subsInserted}`);
    console.log(`  subscription dilewati: ${subs.length - subsInserted} (duplikat)`);
    console.log("\nIsi Neon setelah migrasi:");
    for (const r of after) console.log(`  ${r.t.padEnd(22)}: ${r.n}`);

    if (DRY_RUN) {
      await client.query("ROLLBACK");
      console.log("\nDry-run — semua perubahan di atas dibatalkan.");
      console.log("Jalankan ulang dengan --execute (tambah --wipe kalau dummy mau dihapus).");
    } else {
      await client.query("COMMIT");
      console.log("\n✅ Migrasi selesai.");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await Promise.all([source.end(), target.end()]);
  }
}

main().catch((err) => {
  console.error("\n❌ Migrasi gagal, tidak ada perubahan yang tersimpan.");
  console.error(err);
  process.exit(1);
});
