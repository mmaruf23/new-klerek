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
├── packages/
│   ├── contract/   → Shared types: ApiResponse, Summary, Data
│   └── schema/     → Abaikan, tidak jadi digunakan
├── deploy.sh       → Script deploy Vercel CLI (api, web, atau keduanya)
└── .env.example    → Template env vars termasuk konfigurasi Vercel
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
| GET | `/health/telegram` | — | Kirim ping ke Telegram, cek konfigurasi bot |
| GET | `/health/config` | adminMiddleware | Lihat config aktif (env vars) |
| POST | `/payment/generate` | cookie | Generate QRIS via WijayaPay |
| GET | `/payment` | cookie | List semua payment milik store |
| GET | `/payment/:invoiceId` | cookie | Cek status payment |
| POST | `/payment/callback` | — | Webhook WijayaPay (update status + buat subscription) |

### Auth — Dua Jenis JWT (same secret, beda payload)

1. **Admin JWT** (bearer, 10 menit): payload `{ sub: userId, exp }` — untuk route `/store`
2. **Store Cookie JWT** (7 hari): payload `{ store_id, exp }` — cookie `access_token`, untuk kasir

`adminMiddleware` di `auth/middleware.ts` verifikasi signature + wajib ada `sub` claim. Store token ditolak di sini.

Cookie di-set dengan `SameSite=None; Secure` di production (cross-domain FE/BE) dan `SameSite=Lax` di development.

### DB Schema

```
users:        id (uuid PK), name, username (unique), password (bcrypt), createdAt
store:        id (varchar 4, PK), name, branchId, createdAt
subscription: id (auto int PK), storeId (FK→store CASCADE), createdAt, expiresAt
payment:      id (auto int PK), invoiceId (unique), storeId (FK→store CASCADE),
              amount (IDR), durationDays, status, qrisUrl, note, createdAt, paidAt
```

- Store ID: 4 karakter, campuran huruf + angka
- `payment.status`: `pending` → `paid` | `failed` | `expired`
- `payment.note`: keterangan bebas, bisa diisi admin untuk penambahan manual
- User admin di-seed via `src/db/seed.ts` (jalankan dengan tsx)

### Alur Upload (`POST /`)

1. Terima `.zip`, ekstrak `.db` SQLite
2. Parse nama file: `{storeID}_{YYYY-MM-DD}_{userID}.db`
3. Cek cookie → jika `store_id` cocok, skip re-check subscription
4. Jika store baru → auto-register + trial 7 hari + notifikasi Telegram
5. Jika store ada + subscription expired → 401 + notifikasi Telegram
6. Query SQLite, return `Summary`
7. Set cookie JWT jika belum ada

### Payment Flow (WijayaPay)

**Generate QRIS (`POST /payment/generate`):**
1. Kasir pilih paket (`packageIndex` dari `subscription/data.ts`)
2. Buat record `payment` dengan status `pending`, `invoiceId = refId` = `klerek-{storeId}-{timestamp}`
3. Panggil WijayaPay `POST /transaction/create` dengan `X-Signature` header
4. Update record dengan `qrisUrl` dari response WijayaPay
5. Return data payment (termasuk `qrisUrl` untuk ditampilkan ke kasir)

**Callback WijayaPay (`POST /payment/callback`):**
1. Verifikasi `X-Signature` header: `MD5(code_merchant + api_key + ref_id)`
2. Cari payment by `ref_id`
3. Jika `status: "paid"` → update payment + buat subscription baru
4. Subscription di-extend dari expiry aktif (bukan dari sekarang)
5. Response wajib `{ status: true }` agar WijayaPay tidak retry

**WijayaPay utility** di `src/utils/wijayapay.ts`:
- `createQris(params)` — panggil API WijayaPay, return `qrImage`, `qrString`, `expiredAt`
- `verifyCallbackSignature(xSignature, refId)` — validasi signature callback

### Pagination (`GET /store`)

Query params: `limit` (default 20) dan `offset` (default 0).
Response: `{ data, total, limit, offset, hasNext }`.

### Subscription & Pricing

- Trial: 7 hari otomatis saat pertama upload
- Paket berbayar: 1K–100K IDR (lihat `subscription/data.ts`)
- Payment gateway: **WijayaPay** — sudah diimplementasikan
- Expired → 401 EXPIRED ACCESS

### Logging (Telegram Bot)

Implementasi di `src/utils/telegram.ts`. Semua fungsi **async — wajib di-`await`**.

- `sendLog(message)` — kirim notifikasi, no-op jika env tidak diisi atau bukan production
- `pingTelegram()` — kirim "🏓 pong", return `boolean` (dipakai `GET /health/telegram`)

Event yang dikirim ke Telegram:
- 🔴 Server error (500) / DB health check gagal
- 🔴 Generate QRIS gagal
- 🔴 Callback signature tidak valid
- 🏪 Toko baru terdaftar
- ⚠️ Subscription expired saat upload
- ✅ Pembayaran berhasil

Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — no-op jika tidak diisi.

### CORS

Origin dikonfigurasi via env var `CORS_ORIGIN` (default `*`). Di production isi dengan URL frontend.

### Error Handling

Semua via class `Exception` di `error.ts` → `HTTPException` Hono:
- `Validation()` → 409, `BadRequest()` → 400, `NotFound()` → 404
- `Unauthorized()` → 401, `ServerError()` → 500

### Konfigurasi

`src/config.ts` export langsung `config` (bukan fungsi). Import: `import { config } from '../config.js'`.

| Env Var | Default | Keterangan |
|---------|---------|------------|
| `DATABASE_URL` | postgresql localhost | Neon connection string di production |
| `JWT_SECRET` | `ngasalajaudah` | Secret signing JWT |
| `NODE_ENV` | `development` | Set `production` di Vercel |
| `CORS_ORIGIN` | `*` | URL frontend, contoh: `https://app.vercel.app` |
| `TELEGRAM_BOT_TOKEN` | `""` | Token bot Telegram |
| `TELEGRAM_CHAT_ID` | `""` | Chat/group ID tujuan log |
| `WIJAYAPAY_MERCHANT_ID` | `""` | Code merchant WijayaPay |
| `WIJAYAPAY_API_KEY` | `""` | API key WijayaPay |
| `WIJAYAPAY_BASE_URL` | `https://wijayapay.com/api` | Base URL API WijayaPay |
| `WIJAYAPAY_CALLBACK_URL` | `""` | URL callback dikirim ke WijayaPay saat generate, contoh: `https://api.vercel.app/payment/callback` |

Lihat `apps/api/.example.env` untuk template lengkap.

---

## Frontend (`apps/web`)

### Tech Stack
- **Framework:** React 19 + Vite
- **Routing:** React Router v7 (SPA, BrowserRouter)
- **Styling:** Tailwind v4 + shadcn/ui components (style: `new-york`, via CLI)
- **State:** SummaryContext + AdminContext (React Context + sessionStorage)
- **Deploy:** Vercel

### Struktur
```
src/
├── context/
│   ├── SummaryContext.tsx   → Context + sessionStorage hydration
│   └── AdminContext.tsx     → Context token admin
├── pages/
│   ├── UploadPage.tsx       → Halaman upload file (/)
│   ├── SummaryPage.tsx      → Halaman rekap harian (/summary)
│   └── admin/
│       ├── AdminLoginPage.tsx  → Login admin (/admin/login)
│       └── AdminStorePage.tsx  → Daftar store (/admin/stores)
├── components/ui/           → shadcn components: Button, Card, Badge (tambah komponen: `pnpm dlx shadcn@latest add <komponen>`)
├── lib/utils.ts             → cn() utility (clsx + tailwind-merge)
└── App.tsx                  → BrowserRouter + Routes + SummaryProvider
```

### Halaman

| Route | Deskripsi |
|-------|-----------|
| `/` | Upload file `.zip` — drag & drop atau file picker, POST ke API |
| `/summary` | Rekap harian — info toko, total faktur & nominal, daftar transaksi ringkas |
| `/admin/login` | Login admin |
| `/admin/stores` | Daftar store + pagination (auth: admin JWT) |

### State Management

`SummaryContext` menyimpan data `Summary` dari API:
- Hydrate dari `sessionStorage` sekali saat app load (key: `klerek_summary`)
- `setSummary()` update state sekaligus tulis ke sessionStorage
- Komponen baca dari Context (in-memory, tidak parse JSON berulang)

### Konfigurasi

Env var: `VITE_API_URL` — URL backend API. Default kosong (same-origin).
Contoh: lihat `apps/web/.env.example`.

---

## Deploy

Deployment menggunakan Vercel CLI via script `deploy.sh` di root monorepo.

```bash
./deploy.sh        # deploy apps/api + apps/web
./deploy.sh api    # deploy apps/api saja
./deploy.sh web    # deploy apps/web saja
```

Script membaca konfigurasi dari `.env` di root. Salin `.env.example` ke `.env` lalu isi nilainya.

Script **selalu deploy dari monorepo root** agar pnpm dapat resolve dependency `workspace:*` dari `packages/contract`. Vercel menggunakan "Root Directory" project setting untuk menentukan subdirektori build.

### Setup Vercel (satu kali)

Di Vercel dashboard, untuk masing-masing project:
- Project `apps/api` → Settings → General → **Root Directory** = `apps/api`
- Project `apps/web` → Settings → General → **Root Directory** = `apps/web`

### Env Vars Deployment

| Key | Keterangan |
|-----|------------|
| `VERCEL_TOKEN` | API token — [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Team/Org ID — Vercel dashboard → Settings → General |
| `VERCEL_API_PROJECT_ID` | Project ID `apps/api` — project settings di Vercel |
| `VERCEL_WEB_PROJECT_ID` | Project ID `apps/web` — project settings di Vercel |

---

## Hal yang Belum Selesai / Perlu Dikerjakan

- [ ] Refresh token untuk admin login (token saat ini expire 10 menit, belum ada mekanisme refresh)
- [ ] Halaman frontend untuk payment flow (generate QRIS, tampilkan QR, cek status)
- [x] Implementasi payment flow (WijayaPay — generate QRIS, callback, auto-extend subscription)
- [x] Deploy frontend ke Vercel (via `deploy.sh`)
- [x] Halaman admin untuk lihat daftar store
