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
│   ├── contract/   → Shared types & Zod schemas: ApiResponse, Summary, auth schemas, JwtClaims
│   └── schema/     → Abaikan, tidak jadi digunakan
├── Makefile        → Shortcut dev & deploy
├── deploy.sh       → Script deploy Vercel CLI (api, web, atau keduanya)
└── .env.example    → Template env vars termasuk konfigurasi Vercel
```

## Makefile

```bash
make dev          # jalankan api + web paralel
make dev-api      # api saja
make dev-web      # web saja
make deploy       # deploy api + web ke Vercel
make deploy-api   # deploy api saja
make deploy-web   # deploy web saja
make migrate-run  # jalankan migrasi DB
make migrate-gen  # generate file migrasi baru
```

---

## Shared Package (`packages/contract`)

Dibangun dengan `tsup` → output ke `dist/`. **Wajib rebuild setelah edit src:**

```bash
pnpm --filter @packages/contract build
```

Berisi:
- `response.ts` — `ApiResponse<T>`, `Summary`, `Data`, `StoreResponse`
- `jwt.ts` — `JwtClaims` interface (extend `JwtPayload`)
- `auth.ts` — Zod schemas (`loginSchema`, `registerSchema`) + inferred types (`LoginInput`, `RegisterInput`) + `ProfileResponse`, `ReferredStore`
- `constant.ts` — konstanta `time`

`JwtClaims` harus selalu diimport dari `@packages/contract`, **bukan** dari `utils/jwt.ts`.

---

## Backend (`apps/api`)

### Tech Stack
- **Framework:** Hono v4 (TypeScript, ESM)
- **Deploy:** Vercel Serverless — BUKAN environment Node.js biasa
- **ORM:** Drizzle ORM
- **DB Prod:** Neon (neon-http driver) — wajib untuk serverless
- **DB Dev:** PostgreSQL lokal (node-postgres)
- **Validation:** Zod (schemas di `@packages/contract`)
- **File parsing:** AdmZip (unzip) + better-sqlite3 (SQLite in-memory)

### Route Map

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/` | cookie (opsional) | Upload zip SQLite, return summary transaksi |
| POST | `/auth/login` | — | Login → JWT bearer (10 menit) |
| POST | `/auth/register` | — | Registrasi user baru (role: "user", referral code auto-generate) |
| GET | `/auth/me` | authMiddleware | Profil user yang sedang login + list toko referral + totalBalance |
| GET | `/auth/balance` | authMiddleware | Riwayat balance user (credit & debit), urut terbaru |
| GET | `/store` | authMiddleware | List semua store + pagination meta |
| GET | `/store/:id` | authMiddleware | Detail store + subscription aktif |
| POST | `/store/:id/subscribe` | authMiddleware | Tambah subscription toko via balance (hanya toko referral sendiri; superadmin gratis) |
| GET | `/health` | — | API health check |
| GET | `/health/db` | — | DB health check (jalankan SELECT 1) |
| GET | `/health/telegram` | — | Kirim ping ke Telegram, cek konfigurasi bot |
| GET | `/health/config` | authMiddleware | Lihat config aktif (env vars) |
| POST | `/payment/generate` | cookie | Generate QRIS via WijayaPay |
| GET | `/payment` | cookie | List semua payment milik store |
| GET | `/payment/:invoiceId` | cookie | Cek status payment |
| POST | `/payment/callback` | — | Webhook WijayaPay (update status + buat subscription + kredit balance referrer 50%) |

### Auth — Dua Jenis JWT (same secret, beda payload)

1. **User/Admin JWT** (bearer, 10 menit): payload `{ sub: userId, role, exp }` — untuk route `/store`, `/auth/me`
2. **Store Cookie JWT** (7 hari): payload `{ store_id, exp }` — cookie `access_token`, untuk kasir

`authMiddleware` di `auth/middleware.ts` verifikasi signature + wajib ada `sub` claim. Store token ditolak di sini.

Cookie di-set dengan `SameSite=None; Secure` di production (cross-domain FE/BE) dan `SameSite=Lax` di development.

### Validasi Request

Semua endpoint yang menerima body menggunakan Zod `safeParse`. Schema didefinisikan di `@packages/contract/src/auth.ts` dan diimport langsung — tidak ada schema lokal di `apps/api`.

```ts
const result = loginSchema.safeParse(body);
if (!result.success) {
  return c.json({ success: false, message: result.error.issues[0].message }, 400);
}
```

### DB Schema

```
users:        id (uuid PK), name, username (unique), password (bcrypt),
              role (enum: user|admin|superadmin, default: user),
              refferalCode (varchar 10, unique), createdAt, updatedAt
store:        id (varchar 4, PK), name, branchId, createdAt,
              referrerId (FK → users.refferalCode, ON DELETE SET NULL)
subscription: id (auto int PK), storeId (FK→store CASCADE), createdAt, expiresAt
payment:      id (auto int PK), invoiceId (unique), storeId (FK→store CASCADE),
              amount (IDR), durationDays, status, qrisUrl, note, createdAt, paidAt
balance:      id (auto int PK), userId (FK→users CASCADE), amount, createdAt
```

- Store ID: 4 karakter, campuran huruf + angka
- Referral code: 6 karakter, huruf kapital + angka, auto-generate saat register
- `payment.status`: `pending` → `paid` | `failed` | `expired`
- `payment.note`: keterangan bebas, bisa diisi admin untuk penambahan manual
- User admin di-seed via `src/db/seed.ts` (jalankan dengan tsx)
- Kolom `refferalCode` di schema JS (dua 'f') → kolom `referal_code` di DB (satu 'r') — typo lama, jangan diperbaiki tanpa migrasi

### Alur Upload (`POST /`)

1. Terima `.zip`, ekstrak `.db` SQLite
2. Parse nama file: `{storeID}_{YYYY-MM-DD}_{userID}.db`
3. Cek cookie → jika `store_id` cocok, skip re-check subscription
4. Jika store baru → auto-register + trial 7 hari + notifikasi Telegram
5. Jika store ada + subscription expired → 401 + notifikasi Telegram
6. Query SQLite, return `Summary`
7. Set cookie JWT jika belum ada

### Registrasi User (`POST /auth/register`)

- Field: `name`, `username`, `password` (validasi Zod)
- Role selalu `"user"` — tidak bisa dipilih dari request
- Referral code: 6 karakter `A-Z0-9`, generate random, retry max 5x jika collision
- Return: `{ id, name, username, referralCode }`

### Profil User (`GET /auth/me`)

- Ambil `sub` dari JWT payload → query user
- Sertakan list store yang `referrerId = user.refferalCode`
- Return `ProfileResponse`: `{ id, name, username, role, referralCode, referredStores[] }`

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
- **Routing:** React Router v7 (SPA, createBrowserRouter)
- **Styling:** Tailwind v4 + shadcn/ui components (style: `new-york`, via CLI)
- **State:** sessionStorage (summary, token) — tidak ada global state manager
- **Deploy:** Vercel

### Struktur
```
src/
├── pages/
│   ├── HomePage.tsx          → Upload file (/)
│   ├── SummaryPage.tsx       → Rekap harian (/summary)
│   ├── DetailPage.tsx        → Detail transaksi (/detail)
│   ├── MembershipPage.tsx    → Halaman membership (/membership)
│   ├── ContactPage.tsx       → Halaman kontak (/contact)
│   ├── DashboardPage.tsx     → Daftar store — admin (/stores)
│   ├── ProfilePage.tsx       → Profil user + list toko referral (/profile)
│   └── auth/
│       ├── LoginPage.tsx     → Login (/auth/login)
│       └── RegisterPage.tsx  → Registrasi user baru (/auth/register)
├── components/
│   ├── layout/
│   │   ├── Layout.tsx        → Layout publik (Navbar + outlet)
│   │   └── AdminLayout.tsx
│   ├── Navbar.tsx
│   ├── ButtonTabBar.tsx
│   └── ui/                  → shadcn components (tambah: `pnpm dlx shadcn@latest add <komponen>`)
├── hooks/
│   ├── useUpload.ts          → Upload file, navigate ke /summary setelah sukses
│   ├── useAdminLogin.ts      → Login admin, simpan token ke sessionStorage
│   └── useRegister.ts        → Registrasi user baru
├── services/
│   ├── authApi.ts            → loginAdmin(), registerUser(), fetchProfile()
│   ├── adminApi.ts           → fetchStores()
│   └── uploadApi.ts          → uploadFile()
├── lib/
│   ├── authGuard.ts          → Middleware react-router: requireAuth, requireAdmin, redirectIfAuthenticated
│   └── utils.ts              → cn() utility
├── config.ts                 → Config dari env vars (API_URL, ACCESS_TOKEN_KEY, dll)
└── router.tsx                → Router + export `routes` object
```

### Halaman

| Route | Auth | Deskripsi |
|-------|------|-----------|
| `/` | — | Upload file `.zip` — drag & drop atau file picker |
| `/summary` | — | Rekap harian (data dari sessionStorage loader) |
| `/detail` | — | Detail transaksi per item |
| `/membership` | — | Informasi paket membership |
| `/contact` | — | Kontak |
| `/auth/login` | redirect jika sudah login | Form login |
| `/auth/register` | — | Form registrasi user baru |
| `/profile` | requireAuth | Profil user + list toko yang direferral |
| `/stores` | requireAuth | Daftar store + pagination (admin) |

### Routing & Navigasi

Route strings dipusatkan di `router.tsx` sebagai object `routes` yang di-export:

```ts
export const routes = {
  home: "/",
  summary: "/summary",
  detail: "/detail",
  membership: "/membership",
  contact: "/contact",
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  profile: "/profile",
  stores: "/stores",
} as const;
```

**Wajib** gunakan `routes.*` untuk semua navigasi dan `<Link to={...}>` — jangan tulis string path secara langsung.

### Auth Guard (frontend)

`lib/authGuard.ts` menyediakan middleware react-router:
- `requireAuthMiddleware` — cek ada token + `role` claim, redirect ke `/auth/login` jika tidak ada
- `requireAdminMiddleware` — cek role `admin` atau `superadmin`
- `requireUserMiddleware` — cek role `user`
- `redirectIfAuthenticatedMiddleware` — redirect ke `/` jika sudah login

Token disimpan di `sessionStorage` dengan key dari `config.ACCESS_TOKEN_KEY`.

### Konfigurasi

| Env Var | Keterangan |
|---------|------------|
| `VITE_API_URL` | URL backend API (default: kosong = same-origin) |
| `VITE_ACCESS_TOKEN_KEY` | Key sessionStorage untuk token (default: `access_token`) |
| `VITE_STORE_PAGE_LIMIT` | Jumlah store per halaman di dashboard (default: 20) |

Lihat `apps/web/.env.example` untuk template lengkap.

---

## Deploy

Deployment menggunakan Vercel CLI via script `deploy.sh` di root monorepo, atau via Makefile.

```bash
make deploy      # deploy apps/api + apps/web
make deploy-api  # deploy apps/api saja
make deploy-web  # deploy apps/web saja
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

- [ ] Refresh token — JWT expire 10 menit, belum ada mekanisme refresh
- [ ] Halaman frontend untuk payment flow (generate QRIS, tampilkan QR, cek status)
- [x] Implementasi payment flow (WijayaPay — generate QRIS, callback, auto-extend subscription)
- [x] Deploy frontend ke Vercel (via `deploy.sh` / Makefile)
- [x] Halaman admin untuk lihat daftar store
- [x] Registrasi user + halaman register
- [x] Halaman profil user (referral code + list toko referral)
- [x] Zod validation untuk semua request body (schema di `@packages/contract`)
- [x] Route strings dipusatkan di `routes` object — tidak ada hardcoded string path
