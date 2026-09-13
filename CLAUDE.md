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
├── env.sh          → Kelola env vars project Vercel (list/push/pull/set/rm)
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
make env-list APP=api   # lihat env di Vercel (APP=api|web, default api)
make env-push APP=web   # upload apps/<app>/.env.production ke Vercel
make env-pull APP=api   # download env Vercel ke apps/<app>/.env.production
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
- `payment.ts` — `generatePaymentSchema` + `GeneratePaymentInput`, `PaymentStatus`, `PaymentResponse`
- `auth.ts` — Zod schemas (`googleAuthSchema`, `referStoreSchema`) + inferred types (`GoogleAuthInput`, `ReferStoreInput`) + `ProfileResponse`, `LoginResponse`, `ReferredStore`
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
| POST | `/auth/google` | — | Login/registrasi via Google SSO (kirim `credential` ID token) → JWT bearer (10 menit) + cookie `refresh_token` (7 hari) |
| POST | `/auth/refresh` | cookie `refresh_token` | Terbitkan access token baru dari refresh token |
| GET | `/auth/me` | authMiddleware | Profil user yang sedang login + list toko referral + totalBalance |
| GET | `/auth/balance` | authMiddleware | Riwayat balance user (credit & debit), urut terbaru |
| GET | `/store` | authMiddleware | List semua store + pagination meta |
| GET | `/store/:id` | authMiddleware | Detail store + subscription aktif |
| POST | `/store/:id/subscribe` | authMiddleware | Tambah subscription toko via balance (hanya toko referral sendiri; superadmin gratis) |
| GET | `/health` | — | API health check |
| GET | `/health/db` | — | DB health check (jalankan SELECT 1) |
| GET | `/health/telegram` | — | Kirim ping ke Telegram, cek konfigurasi bot |
| GET | `/health/config` | authMiddleware | Lihat config aktif (env vars) |
| POST | `/payment/generate` | — | Buat donasi QRIS di Saweria (body: `storeId`, `packageIndex`, `email`); reuse QR pending yang masih berlaku |
| GET | `/payment` | cookie | List semua payment milik store (belum dipakai FE) |
| GET | `/payment/:invoiceId` | — | Cek status payment dari DB (tandai `expired` jika > 15 menit) |
| POST | `/payment/webhook` | query `token` | Webhook Saweria: cocokkan `id` → `fulfillPayment` (subscription + kredit balance referrer 50%) |
| GET | `/admin/users` | authMiddleware + admin | List user + pagination + search `q` (nama/email) |
| GET | `/admin/users/:id` | authMiddleware + admin | Detail user + toko referral + balance |
| POST | `/admin/users/:id/balance` | authMiddleware + admin | Sesuaikan balance user manual (credit/debit + note) |
| POST | `/admin/users/:id/role` | authMiddleware + superadmin | Ubah role user (`admin` ⇄ `user`); tolak self & target superadmin |

### Auth — Google SSO (user/admin) + Store Cookie (kasir)

**Login user/admin hanya via Google SSO** — tidak ada username/password:
1. Frontend render tombol Google (GIS via `@react-oauth/google`) → dapat ID token (`credential`)
2. `POST /auth/google` → backend verifikasi ID token dengan `jose` (JWKS Google, cek issuer + audience `GOOGLE_CLIENT_ID`, wajib `email_verified`) di `src/utils/googleAuth.ts`
3. Find-or-create user by email — user baru auto-terdaftar (referral code auto-generate)
4. **Role bersifat DB-authoritative** — tidak ada whitelist env. User baru selalu `user`; login tidak pernah menimpa role user lama (hanya sync `name`/`googleId`/`avatarUrl`). Promosi/demosi `admin` ⇄ `user` via panel superadmin (`POST /admin/users/:id/role`); superadmin pertama dibuat via seed bootstrap (`src/db/seed.ts`)
5. Backend terbitkan JWT sendiri (bukan token Google)

**Tiga jenis JWT aplikasi** (same secret, beda payload):
1. **Access token** (bearer, 10 menit): payload `{ sub: userId, role, name, type: "access", exp }` — untuk route `/store`, `/auth/me`
2. **Refresh token** (cookie `refresh_token` httpOnly, 7 hari): payload sama dengan `type: "refresh"` — untuk `POST /auth/refresh`
3. **Store Cookie JWT** (7 hari): payload `{ store_id, exp }` — cookie `store_token`, untuk kasir

`authMiddleware` di `auth/middleware.ts` verifikasi signature + wajib ada `sub` claim + tolak `type: "refresh"`. Store token ditolak di sini.

Cookie di-set dengan `SameSite=None; Secure` di production (cross-domain FE/BE) dan `SameSite=Lax` di development.

**Setup Google Cloud Console (satu kali):** buat OAuth 2.0 Client ID (Web application), isi Authorized JavaScript origins dengan `http://localhost:5173` + domain web production. Tidak perlu redirect URI (flow popup GIS). Satu client ID dipakai web + api.

### Validasi Request

Semua endpoint yang menerima body menggunakan Zod `safeParse`. Schema didefinisikan di `@packages/contract/src/auth.ts` dan diimport langsung — tidak ada schema lokal di `apps/api`.

```ts
const result = googleAuthSchema.safeParse(body);
if (!result.success) {
  return c.json({ success: false, message: result.error.issues[0].message }, 400);
}
```

### DB Schema

```
users:        id (uuid PK), name, email (unique), googleId (unique), avatarUrl,
              role (enum: user|admin|superadmin, default: user),
              refferalCode (varchar 10, unique), createdAt, updatedAt
store:        id (varchar 4, PK), name, branchId, createdAt,
              referrerId (FK → users.refferalCode, ON DELETE SET NULL)
subscription: id (auto int PK), storeId (FK→store CASCADE), createdAt, expiresAt
payment:      id (auto int PK), invoiceId (unique, = donation id Saweria), storeId (FK→store CASCADE),
              amount (IDR), durationDays, status, qrString (payload QRIS mentah), note, createdAt, paidAt
balance:      id (auto int PK), userId (FK→users CASCADE), amount, createdAt
daily_summary: id (auto int PK), storeId (FK→store CASCADE), userId (kasir, varchar 8),
              dateTx (date), totalFaktur, memberFaktur, totalCash, createdAt, updatedAt
              UNIQUE (storeId, dateTx, userId)
```

- Store ID: 4 karakter, campuran huruf + angka
- Referral code: 6 karakter, huruf kapital + angka, auto-generate saat login Google pertama
- `payment.status`: `pending` → `paid` | `failed` | `expired`
- `payment.note`: keterangan bebas; saat generate diisi `klerek-{storeId}-{timestamp}` (= `message` yang tampil di dashboard Saweria), bisa diisi admin untuk penambahan manual
- Tidak ada seed user — user dibuat otomatis saat login Google (selalu role `user`). Role adalah DB-authoritative: superadmin pertama di-bootstrap via `src/db/seed.ts` (`pnpm --filter api exec tsx ./src/db/seed.ts <email>`), selanjutnya admin ⇄ user via panel superadmin
- Kolom `refferalCode` di schema JS (dua 'f') → kolom `referal_code` di DB (satu 'r') — typo lama, jangan diperbaiki tanpa migrasi

### Migrasi Data dari Project Lama (`../next-klerek`)

Project lama (Next.js + Supabase) punya skema berbeda. Migrasi dilakukan **manual** (pg_dump / export file) — tidak ada script di repo ini. Yang dipindah hanya `store` dan `subscription`.

| Lama (Supabase) | Baru | Catatan |
|------|------|---------|
| `store.id`, `.name`, `.created_at` | sama | ⚠️ `store.id` lama bertipe `text`, yang baru `varchar(4)` — id lebih panjang akan ditolak |
| `subscription.subs_type` (enum) | `isTrial` (boolean) | `trial` → `true`, sisanya (`daily`/`weekly`/`monthly`/`yearly`) → `false` |
| `subscription.expired_at` | `expiresAt` | |
| `transaction` lama (`store_id`, `nik`, `date_tx`, `amount`) | `daily_summary` | bentuknya mirip (`nik` → `userId`, `amount` → `totalCash`) tapi belum dimigrasi; `totalFaktur` tidak ada di data lama |
| `store.referral` | — | **tidak dipindah**: di skema lama itu FK ke `store.id` (toko → toko), sedangkan `store.referrerId` baru menunjuk `users.refferalCode` (user → toko). Toko lama di-klaim ulang lewat alur referral yang sekarang |
| `transaction.branch_id` lama | `store.branchId` | satu-satunya sumber branch_id di skema lama; opsional |

Hati-hati saat impor ulang: `subscription` tidak punya unique key, jadi menjalankan impor dua kali akan menggandakan langganan.

### Alur Upload (`POST /`)

1. Terima `.zip`, ekstrak `.db` SQLite
2. Parse nama file: `{storeID}_{YYYY-MM-DD}_{userID}.db` (storeID, userID, dan tanggal divalidasi)
3. Cek cookie → jika `store_id` cocok, skip re-check subscription
4. Jika store baru → auto-register + trial 7 hari + notifikasi Telegram
5. Jika store ada + subscription expired → 401 + notifikasi Telegram
6. Query SQLite → `Summary`
7. Simpan rekap harian ke tabel `daily_summary` (`features/summary/service.ts`) — best effort: kegagalan hanya di-log + kirim Telegram, upload tetap sukses
8. Set cookie JWT jika belum ada, return `Summary`

**Penyimpanan rekap harian (`saveDailySummary`)**

- Satu baris per `(storeId, dateTx, userId)` berisi `totalFaktur` (jumlah struk), `memberFaktur` (struk dengan member, tidak distinct), `totalCash` (jumlah `cash` semua faktur). Detail per faktur/item **tidak** disimpan
- Upsert: upload ulang file yang sama menimpa angka lama (`onConflictDoUpdate`), bukan menggandakan baris
- `dateTx` diambil dari nama file (`YYYY-MM-DD`)

### Login Google (`POST /auth/google`)

- Body: `{ credential }` (ID token dari GIS, validasi `googleAuthSchema`)
- User baru: auto-insert dengan `name`/`email`/`googleId`/`avatarUrl` dari Google + referral code 6 karakter `A-Z0-9` (retry max 5x jika collision) + notifikasi Telegram
- User lama: sync `name`/`googleId`/`avatarUrl` jika berubah — **role tidak pernah ditimpa saat login**
- Role tidak pernah dari request; perubahan role hanya via `POST /admin/users/:id/role` (superadmin) atau seed bootstrap
- Return: `LoginResponse` `{ user: { id, name, email, role }, token }` + set cookie `refresh_token`

### Profil User (`GET /auth/me`)

- Ambil `sub` dari JWT payload → query user
- Sertakan list store yang `referrerId = user.refferalCode`
- Return `ProfileResponse`: `{ id, name, email, avatarUrl, role, referralCode, referredStores[], totalBalance }`

### Payment Flow (Saweria)

Create donasi memakai endpoint internal `backend.saweria.co` (tidak terdokumentasi resmi, hasil eksplorasi manual). Konfirmasi pembayaran lewat **webhook** Saweria — tidak ada polling ke Saweria (hemat limit Vercel).

Endpoint payment **public** — tidak pakai cookie `store_token`. Alasan: cookie hanya di-set saat upload sukses, sedangkan toko expired ditolak sebelum itu → tidak pernah bisa bayar. Siapa pun boleh membayar untuk toko mana pun (hanya memberi subscription, tidak ada keuntungan bagi penyerang).

**Generate QRIS (`POST /payment/generate`):**
1. Body `{ storeId, packageIndex, email }`, validasi `generatePaymentSchema`; toko harus ada (404)
2. Jika ada payment `pending` belum expired untuk `(storeId, amount)` → kembalikan yang itu (anti-spam, refresh tidak bikin QR baru)
3. Panggil Saweria `POST /donations/snap/{SAWERIA_USER_ID}` dengan `amount`, `payment_type: "qris"`, `message = klerek-{storeId}-{timestamp}`, `customer_info.email` dari kasir
4. Simpan record `payment` status `pending`: `invoiceId` = `data.id` Saweria, `qrString` = `data.qr_string`, `note` = message
5. Frontend render QR dari `qrString` dengan `qrcode.react`, lalu polling `GET /payment/:invoiceId` tiap 5 detik

**Webhook (`POST /payment/webhook?token=...`):**
1. Verifikasi `token` query = `SAWERIA_WEBHOOK_TOKEN` (shared secret; URL webhook di dashboard Saweria diisi lengkap dengan `?token=`). Tidak valid → 401 + log Telegram
2. Cari payment by `body.id` (= donation id). Tidak ada → donasi langsung dari halaman Saweria, abaikan + log ℹ️
3. `amount_raw < payment.amount` → abaikan + log ⚠️
4. `fulfillPayment`: update `paid` + buat subscription (extend dari expiry aktif) + kredit balance referrer 50%. Idempoten — hanya payment `pending`, jadi webhook ganda aman
5. Selalu balas 200 untuk kasus yang diabaikan agar Saweria tidak retry

**Cek status (`GET /payment/:invoiceId`):** baca DB saja; `pending` berumur > `PAYMENT_TTL_MS` (15 menit, sama dengan countdown frontend) → tandai `expired`.

**Saweria utility** di `src/utils/saweria.ts`:
- `createDonation({ amount, message, donatorName, donatorEmail })` — return `{ id, qrString, amount }`
- `verifyWebhookToken(token)` — bandingkan dengan `SAWERIA_WEBHOOK_TOKEN`
- `SaweriaWebhookPayload` — tipe body webhook (`id`, `amount_raw`, `donator_name`, `donator_email`, `message`, …)

### Pagination (`GET /store`)

Query params: `limit` (default 20) dan `offset` (default 0).
Response: `{ data, total, limit, offset, hasNext }`.

### Subscription & Pricing

- Trial: 7 hari otomatis saat pertama upload
- Paket berbayar: 1K–100K IDR (lihat `subscription/data.ts`)
- Payment gateway: **Saweria** (create via endpoint internal, konfirmasi via webhook)
- Expired → 401 EXPIRED ACCESS

### Logging (Telegram Bot)

Implementasi di `src/utils/telegram.ts`. Semua fungsi **async — wajib di-`await`**.

- `sendLog(message)` — kirim notifikasi, no-op jika env tidak diisi atau bukan production
- `pingTelegram()` — kirim "🏓 pong", return `boolean` (dipakai `GET /health/telegram`)

Event yang dikirim ke Telegram:
- 🔴 Server error (500) / DB health check gagal
- 🔴 Generate QRIS gagal
- 🏪 Toko baru terdaftar
- 👤 User baru login via Google
- ⚠️ Subscription expired saat upload
- ✅ Pembayaran berhasil
- 🔴 Webhook Saweria token tidak valid / ℹ️ donasi tanpa payment / ⚠️ nominal kurang

Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — no-op jika tidak diisi.

### CORS

Origin dikonfigurasi via env var `CORS_ORIGIN` (default `*`). Di production isi dengan URL frontend.

### Error Handling

Semua via class `Exception` di `error.ts` → `HTTPException` Hono:
- `Validation()` → 409, `BadRequest()` → 400, `NotFound()` → 404
- `Unauthorized()` → 401, `Forbidden()` → 403, `ServerError()` → 500

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
| `GOOGLE_CLIENT_ID` | `""` | OAuth Client ID Google — cek `aud` saat verifikasi ID token |
| `SAWERIA_BASE_URL` | `https://backend.saweria.co` | Base URL endpoint internal Saweria |
| `SAWERIA_USER_ID` | `""` | User ID akun Saweria penerima donasi (nilai tetap) |
| `SAWERIA_WEBHOOK_TOKEN` | `""` | Shared secret webhook — URL webhook di Saweria: `https://api.klerek.my.id/payment/webhook?token=<nilai>` |

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
│       └── LoginPage.tsx     → Login via tombol Google (/auth/login)
├── components/
│   ├── layout/
│   │   ├── Layout.tsx        → Layout publik (Navbar + outlet)
│   │   └── AdminLayout.tsx
│   ├── Navbar.tsx
│   ├── ButtonTabBar.tsx
│   └── ui/                  → shadcn components (tambah: `pnpm dlx shadcn@latest add <komponen>`)
├── hooks/
│   ├── useUpload.ts          → Upload file, navigate ke /summary setelah sukses
│   └── useGoogleLogin.ts     → Login Google, simpan token ke sessionStorage
├── services/
│   ├── authApi.ts            → loginWithGoogle(), fetchProfile()
│   ├── adminApi.ts           → fetchStores()
│   └── uploadApi.ts          → uploadFile()
├── lib/
│   ├── authGuard.ts          → Middleware react-router: requireAuth, requireAdmin, redirectIfAuthenticated (dengan silent refresh)
│   ├── http.ts               → fetchWithAuth(): bearer + auto-refresh saat 401 (deduped, retry sekali)
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
| `/auth/login` | redirect jika sudah login | Tombol "Sign in with Google" (GIS) |
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
  profile: "/profile",
  dashboard: "/dashboard",
  refer: "/refer",
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
| `VITE_GOOGLE_CLIENT_ID` | OAuth Client ID Google untuk tombol GIS (sama dengan `GOOGLE_CLIENT_ID` di api) |

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

### Kelola Env Vars di Vercel (`env.sh`)

```bash
./env.sh <api|web> list              # tampilkan env
./env.sh <api|web> push [file]       # upload semua KEY=VALUE dari file (default apps/<app>/.env.production)
./env.sh <api|web> pull [file]       # download env ke file
./env.sh <api|web> set KEY VALUE     # set satu variabel (timpa jika ada)
./env.sh <api|web> rm KEY            # hapus satu variabel
```

Target environment default `production`; ganti dengan `VERCEL_ENV=preview ./env.sh ...`. `push`/`set` menghapus key lama lalu menambah ulang (Vercel menolak duplikat). Setelah ubah env, **redeploy** agar aktif. `apps/*/.env.production` di-gitignore.

### Env Vars Deployment

| Key | Keterangan |
|-----|------------|
| `VERCEL_TOKEN` | API token — [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Team/Org ID — Vercel dashboard → Settings → General |
| `VERCEL_API_PROJECT_ID` | Project ID `apps/api` — project settings di Vercel |
| `VERCEL_WEB_PROJECT_ID` | Project ID `apps/web` — project settings di Vercel |

---

## Hal yang Belum Selesai / Perlu Dikerjakan

- [x] Refresh token — JWT expire 10 menit, belum ada mekanisme refresh
- [x] Halaman frontend untuk payment flow (generate QRIS, tampilkan QR, cek status)
- [x] Implementasi payment flow (Saweria — generate QRIS, webhook, auto-extend subscription)
- [x] Deploy frontend ke Vercel (via `deploy.sh` / Makefile)
- [x] Halaman admin untuk lihat daftar store
- [x] Registrasi user + halaman register (digantikan auto-register via Google SSO)
- [x] Migrasi auth ke Google SSO (hapus username/password)
- [x] Halaman profil user (referral code + list toko referral)
- [x] Zod validation untuk semua request body (schema di `@packages/contract`)
- [x] Simpan rekap harian (`daily_summary`) saat upload
- [ ] Endpoint baca rekap harian (kasir / user referral / admin)
- [ ] Cron cleanup `daily_summary` > 3 bulan (Vercel Cron + route terproteksi `CRON_SECRET`; tambah index pada `date_tx`)
- [x] Route strings dipusatkan di `routes` object — tidak ada hardcoded string path
- [x] User management: role DB-authoritative + ubah role admin ⇄ user (superadmin only), hapus whitelist env
