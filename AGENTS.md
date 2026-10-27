# AGENTS.md

Dokumentasi arsitektur dan panduan teknis repository **new-klerek** untuk agent AI & developer.

---

## 1. Ringkasan & Domain Proyek
**Klerek** adalah aplikasi web monorepo untuk memproses dan merekap file database POS (Point of Sale) kasir/ritel (SQLite/ZIP), dilengkapi fitur langganan (*subscription* via QRIS Saweria), program komisi referral (*balance*), dan kontrol akses multi-role (superadmin, admin, user).

---

## 2. Struktur Direktori

```text
new-klerek/
├── apps/
│   ├── api/                     # Backend API (Hono + TypeScript)
│   │   ├── src/
│   │   │   ├── constant/        # Paket harga langganan & konstanta waktu
│   │   │   ├── db/              # Drizzle ORM client, schema, dan script seed
│   │   │   ├── features/
│   │   │   │   ├── auth/        # Login Google SSO, password (scrypt), middleware JWT
│   │   │   │   ├── clerek/      # Ekstraksi & rekap transaksi SQLite/ZIP POS
│   │   │   │   ├── health/      # Health check DB, Saweria, Telegram
│   │   │   │   ├── payment/     # Saweria QRIS & Webhook handler
│   │   │   │   ├── store/       # Manajemen toko, perpanjang via saldo, referral
│   │   │   │   ├── subscription/# Logika masa aktif & trial toko
│   │   │   │   └── user/        # CRUD user, manajemen balance & role
│   │   │   ├── types/           # JWT claims & tipe response API standar
│   │   │   ├── utils/           # Helper Saweria, Telegram bot, Google Auth, JWT
│   │   │   ├── config.ts        # Validasi env variables API
│   │   │   ├── error.ts         # Custom Exception & global error handler Hono
│   │   │   └── index.ts         # Inisialisasi router & export Hono AppType (RPC)
│   │   ├── drizzle.config.ts    # Konfigurasi migrasi Drizzle
│   │   ├── server.ts            # Entrypoint Node server (@hono/node-server)
│   │   └── package.json
│   └── web/                     # Frontend SPA (React 19 + Vite)
│       ├── src/
│       │   ├── app/             # Router TanStack & AppProviders (Query, Google OAuth)
│       │   ├── components/      # UI primitive (Radix/Tailwind) & layout (Navbar, Admin)
│       │   ├── features/        # Modul frontend (auth, dashboard, klerek, payment, profile, refer)
│       │   ├── hooks/           # Custom hooks (search params, upload, countdown)
│       │   ├── lib/             # Hono RPC client (apiClient), Auth Guard, Session JWT
│       │   └── utils/           # Format mata uang Rupiah, waktu relatif, inisial avatar
│       ├── vite.config.ts
│       └── package.json
├── Makefile                     # Shortcut dev, deploy, dan migrasi
├── pnpm-workspace.yaml          # Konfigurasi monorepo
└── repomix.config.json          # Konfigurasi pack repo repomix
```

---

## 3. Tech Stack

- **Monorepo Manager**: `pnpm` (Workspace)
- **Backend**:
  - Runtime & Web Framework: Node.js, [Hono](https://hono.dev/) v4
  - Database & ORM: PostgreSQL (Neon Serverless), [Drizzle ORM](https://orm.drizzle.team/)
  - File Processing: `better-sqlite3`, `adm-zip`
  - Auth: JWT (stateless access token + HTTP-only refresh cookie), Google OAuth (`jose`), Scrypt
  - Third-party: Saweria (QRIS donations/snap), Telegram Bot (notifikasi log/error)
- **Frontend**:
  - Framework: React 19, Vite, TypeScript
  - Routing: `@tanstack/react-router`
  - State & Data Fetching: `@tanstack/react-query`
  - Styling: Tailwind CSS v4, Lucide React, Radix UI Slot
  - RPC: `hc<AppType>` dari `hono/client` (type-safe RPC)

---

## 4. Alur Data Utama

1. **Upload & Rekap POS (`/clerek`)**:
   - Client upload file ZIP/SQLite ke endpoint `POST /`.
   - File diparsing secara in-memory menggunakan `better-sqlite3`.
   - Data transaksi diagregasi dan disimpan sebagai rekap harian (`dailySummary`) dengan mekanisme **upsert** per (toko, kasir, tanggal) agar idempoten.
   - Toko baru otomatis didaftarkan dan mendapatkan masa **Trial**.

2. **Pembayaran & Webhook Saweria (`/payment`)**:
   - Client memilih paket -> Backend generate QRIS ke Saweria (`POST /payment/generate`).
   - Terdapat mekanisme anti-spam: QR pending yang belum expired untuk toko dan nominal yang sama akan dipakai ulang.
   - Saweria mengirim notifikasi ke `POST /payment/webhook?token=...`.
   - Status payment diubah ke `paid`, masa aktif toko diperpanjang, dan komisi referral (50%) otomatis ditambahkan ke saldo (`balance`) user referrer jika ada.

3. **Autentikasi & RBAC (`/auth`)**:
   - Mendukung Google One-Tap/SSO dan Email/Password.
   - Role bersifat *DB-authoritative*: `user`, `admin`, `superadmin`. User baru default bertindak sebagai `user`.
   - Akun Superadmin awal dibuat melalui bootstrap seed.

---

## 5. Aturan & Konvensi Proyek

- **Type-Safety End-to-End**: Frontend memanggil API melalui `apiClient` (`hc<AppType>`), mengambil tipe dari `./dist/index.d.ts` milik `@apps/api`.
- **Node.js ESM & Konvensi Import Backend (`apps/api`)**:
  - `apps/api` berjalan di Node.js native ESM (`"type": "module"`) dengan `"moduleResolution": "nodenext"`.
  - **PENTING (Vercel Runtime Rule)**: Semua import relatif internal di `apps/api/src/**/*.ts` **WAJIB menggunakan ekstensi `.js` dan relative path** (misal: `import { x } from "./handler.js"` atau `../../constant/time.js`).
  - **JANGAN** menghapus ekstensi `.js` atau menggantinya dengan path alias non-standar (seperti `@/*` tanpa bundler) di backend. Vercel mentranspile file TypeScript backend apa adanya menjadi Serverless Functions; jika import tidak memiliki ekstensi `.js`, Node.js ESM di Vercel akan melempar runtime error:
    ```text
    Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...' imported from /var/task/apps/api/src/index.js
    ```
- **Kompilasi Deklarasi Tipe Backend (`build-api`)**:
  - Script build backend (`pnpm --filter @apps/api build` atau `make build-api`) menjalankan `tsc` dengan `emitDeclarationOnly: true` untuk memproduksi file `./dist/index.d.ts`.
  - File ini diekspor via field `exports` di `apps/api/package.json` agar terbaca secara aman oleh Vite frontend tanpa memicu kompilasi ulang kode TypeScript backend oleh compiler frontend.
- **Response Standar API**: Format JSON selalu mengikuti tipe `ApiResponse<T>`:
  ```ts
  { success: boolean, data?: T, message?: string | null, page?: Page }
  ```
- **Error Handling**: Gunakan `Exception.*` dari `apps/api/src/error.ts` (misal `Exception.BadRequest()`, `Exception.Unauthorized()`).
- **Idempotensi**: Rekap transaksi POS dan pemrosesan webhook pembayaran harus aman dijalankan berulang tanpa duplikasi data.
- **Role Boundary**: User biasa hanya boleh membaca data toko yang berada di bawah referral miliknya. Admin/Superadmin dapat melihat semua toko.

---

## 6. Perintah Penting & Pengujian

### Development
```bash
# Menjalankan API dan Web sekaligus
make dev
# atau per aplikasi
make dev-api
make dev-web
```

### Build & Tipe
```bash
# Generate types declaration (.d.ts) backend untuk frontend
make build-api
# atau: pnpm --filter @apps/api build

# Build frontend (Vite)
make build-web
# atau: pnpm --filter @apps/web build
```

### Database & Migrasi
```bash
# Generate migrasi skema Drizzle
make migrate-gen
# atau: pnpm --filter @apps/api migration:generate

# Jalankan migrasi ke database
make migrate-run
# atau: pnpm --filter @apps/api migration:run

# Seed bootstrap superadmin pertama
pnpm --filter @apps/api exec tsx ./src/db/seed.ts <email@example.com>
```

### Testing
```bash
# Unit test auth utils pada API
pnpm --filter @apps/api exec tsx ./src/features/auth/utils.test.ts
```

### Build & Lint
```bash
# Build frontend
pnpm --filter @apps/web build

# Lint frontend
pnpm --filter @apps/web lint
```
