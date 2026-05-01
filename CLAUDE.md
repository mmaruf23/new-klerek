# new-klerek

## Gambaran Project

SaaS untuk kasir toko retail Indonesia. Kasir upload file `.zip` berisi SQLite dari software POS → API parse transaksi → return summary rekap harian.

**Filosofi utama: zero cost deployment** — semua platform harus gratis (Neon free tier, Vercel free tier, Telegram Bot, dll).

## Struktur Monorepo (pnpm workspaces)

```
new-klerek/
├── apps/
│   ├── api/        → Backend Hono (TypeScript) — deploy ke Vercel Serverless
│   └── web/        → Frontend React + Vite + Tailwind + shadcn
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
| GET | `/store` | adminMiddleware | List semua store + pagination meta |
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
4. Jika store baru → auto-register + trial 7 hari + notifikasi Telegram
5. Jika store ada + subscription expired → 401 + notifikasi Telegram
6. Query SQLite, return `Summary`
7. Set cookie JWT jika belum ada

### Pagination (`GET /store`)

Query params: `limit` (default 20) dan `offset` (default 0).
Response: `{ data, total, limit, offset, hasNext }`.

### Subscription & Pricing

- Trial: 7 hari otomatis saat pertama upload
- Paket berbayar: 1K–100K IDR (lihat `subscription/data.ts`)
- Payment gateway: **Wijaya Pay** — belum diimplementasikan
- Expired → 401 EXPIRED ACCESS

### Logging (Telegram Bot)

Implementasi di `src/utils/telegram.ts` — fungsi `sendLog(message)` fire-and-forget.
Kirim notifikasi ke group/channel Telegram untuk 3 event:
- 🔴 Server error (500)
- 🏪 Toko baru terdaftar
- ⚠️ Subscription expired saat upload

Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — no-op jika tidak diisi.

### Error Handling

Semua via class `Exception` di `error.ts` → `HTTPException` Hono:
- `Validation()` → 409, `BadRequest()` → 400, `NotFound()` → 404
- `Unauthorized()` → 401, `ServerError()` → 500

### Konfigurasi

`src/config.ts` export langsung `config` (bukan fungsi). Import: `import { config } from '../config.js'`.

Env vars yang dibutuhkan: `DB_URL`, `JWT_SECRET`, `NODE_ENV`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

---

## Frontend (`apps/web`)

### Tech Stack
- **Framework:** React 19 + Vite
- **Routing:** React Router v7 (SPA, BrowserRouter)
- **Styling:** Tailwind v4 + shadcn/ui components (manual setup, tanpa CLI)
- **State:** SummaryContext (React Context + sessionStorage)
- **Deploy:** Vercel (rencana)

### Struktur
```
src/
├── context/
│   └── SummaryContext.tsx   → Context + sessionStorage hydration
├── pages/
│   ├── UploadPage.tsx       → Halaman upload file (/)
│   └── SummaryPage.tsx      → Halaman rekap harian (/summary)
├── components/ui/           → shadcn components: Button, Card, Badge
├── lib/utils.ts             → cn() utility (clsx + tailwind-merge)
└── App.tsx                  → BrowserRouter + Routes + SummaryProvider
```

### Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Upload file `.zip` — drag & drop atau file picker, POST ke API |
| `/summary` | Rekap harian — info toko, total faktur & nominal, daftar transaksi ringkas |

### State Management

`SummaryContext` menyimpan data `Summary` dari API:
- Hydrate dari `sessionStorage` sekali saat app load (key: `klerek_summary`)
- `setSummary()` update state sekaligus tulis ke sessionStorage
- Komponen baca dari Context (in-memory, tidak parse JSON berulang)

### Konfigurasi

Env var: `VITE_API_URL` — URL backend API. Default kosong (same-origin).
Contoh: lihat `apps/web/.env.example`.

---

## Hal yang Belum Selesai / Perlu Dikerjakan

- [ ] Implementasi payment flow (Wijaya Pay)
- [ ] Deploy frontend ke Vercel + set `VITE_API_URL`
- [ ] Refresh token untuk admin login (token saat ini expire 10 menit, belum ada mekanisme refresh)
- [x] Halaman admin untuk lihat daftar store
