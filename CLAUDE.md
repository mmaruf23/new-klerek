# new-klerek

## Gambaran Project

SaaS untuk kasir toko retail Indonesia. Kasir upload file `.zip` berisi SQLite dari software POS → API parse transaksi → return summary rekap harian.

**Filosofi utama: zero cost deployment** — semua platform harus gratis (Neon free tier, Vercel free tier, Telegram Bot, dll).

## Struktur Monorepo (pnpm workspaces)

```
new-klerek/
├── apps/
│   ├── api/        → Backend Hono (TypeScript) — deploy ke Vercel Serverless
│   └── web/        → Frontend React + Vite — belum dibangun
└── packages/
    ├── contract/   → Shared types: ApiResponse, Summary, Data
    └── schema/     → Abaikan, tidak jadi digunakan
```

## Backend (`apps/api`)

### Tech Stack
- **Framework:** Hono v4 (TypeScript, ESM)
- **Deploy:** Vercel Serverless — BUKAN environment Node.js biasa
- **ORM:** Drizzle ORM
- **DB Prod:** Neon (neon-http driver) — wajib untuk serverless
- **DB Dev:** PostgreSQL lokal (node-postgres)
- **File parsing:** AdmZip (unzip) + better-sqlite3 (SQLite in-memory)

### Route Map

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/` | cookie (opsional) | Upload zip SQLite, return summary transaksi |
| POST | `/auth/login` | — | Admin login → JWT bearer (10 menit) |
| GET | `/store` | adminMiddleware | List semua store |
| GET | `/store/:id` | adminMiddleware | Detail store + subscription aktif |
| GET | `/health` | — | API health check |
| GET | `/health/db` | — | DB health check (jalankan SELECT 1) |

### Auth — Dua Jenis JWT (same secret, beda payload)

1. **Admin JWT** (bearer, 10 menit): payload `{ sub: userId, exp }` — untuk route `/store`
2. **Store Cookie JWT** (7 hari): payload `{ store_id, exp }` — cookie `access_token`, untuk kasir

`adminMiddleware` di `auth/middleware.ts` verifikasi signature + wajib ada `sub` claim. Store token ditolak di sini.

### DB Schema

```
users:        id (uuid PK), name, username (unique), password (bcrypt), createdAt
store:        id (varchar 4, PK), name, branchId, createdAt
subscription: id (auto int PK), storeId (FK→store CASCADE), createdAt, expiresAt
```

- Store ID: 4 karakter, campuran huruf + angka
- User admin di-seed via `src/db/seed.ts` (jalankan dengan tsx)

### Alur Upload (`POST /`)

1. Terima `.zip`, ekstrak `.db` SQLite
2. Parse nama file: `{storeID}_{YYYY-MM-DD}_{userID}.db`
3. Cek cookie → jika `store_id` cocok, skip re-check subscription
4. Jika store baru → auto-register + trial 7 hari
5. Jika store ada + subscription expired → 401
6. Query SQLite, return `Summary`
7. Set cookie JWT jika belum ada

### Subscription & Pricing

- Trial: 7 hari otomatis saat pertama upload
- Paket berbayar: 1K–100K IDR (lihat `subscription/data.ts`)
- Payment gateway: **Wijaya Pay** — belum diimplementasikan
- Expired → 401 EXPIRED ACCESS

### Logging

- **Telegram Bot** untuk notifikasi error kritis dan event penting — belum diimplementasikan

### Error Handling

Semua via class `Exception` di `error.ts` → `HTTPException` Hono:
- `Validation()` → 409, `BadRequest()` → 400, `NotFound()` → 404
- `Unauthorized()` → 401, `ServerError()` → 500

### Konfigurasi

`src/config.ts` export langsung `config` (bukan fungsi). Import: `import { config } from '../config.js'`.

Env vars yang dibutuhkan: `DB_URL`, `JWT_SECRET`, `NODE_ENV`

## Hal yang Belum Selesai / Perlu Dikerjakan

- [ ] Implementasi payment flow (Wijaya Pay)
- [ ] Implementasi Telegram Bot logging
- [ ] Pagination meta di `getAllStore`
- [ ] Bangun frontend (`apps/web`)
