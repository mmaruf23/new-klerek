This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where line numbers have been added, content has been compressed (code blocks are separated by ⋮---- delimiter).

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Line numbers have been added to the beginning of each line
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
apps/
  api/
    public/
      favicon.ico
      robot.txt
    src/
      constant/
        price.ts
        time.ts
      db/
        client.ts
        schema.ts
        seed.ts
      features/
        auth/
          handler.ts
          middleware.ts
          service.ts
          utils.test.ts
          utils.ts
          validator.ts
        clerek/
          handler.ts
          helper.ts
          service.ts
          type.ts
        health/
          handler.ts
        payment/
          handler.ts
          service.ts
          validator.ts
        store/
          handler.ts
          helper.ts
          service.ts
          validator.ts
        subscription/
          data.ts
          service.ts
        user/
          handler.ts
          service.ts
          util.ts
          validator.ts
      types/
        jwt.ts
        response.ts
      utils/
        googleAuth.ts
        jwt.ts
        saweria.ts
        telegram.ts
      config.ts
      error.ts
      index.ts
    .env.example
    .gitignore
    drizzle.config.ts
    package.json
    README.md
    server.ts
    tsconfig.json
  web/
    public/
      favicon.svg
      icons.svg
    src/
      app/
        providers/
          AppProviders.tsx
        routes/
          router.tsx
      assets/
        hero.png
        react.svg
        vite.svg
      components/
        layout/
          AdminLayout.tsx
          Layout.tsx
        ui/
          badge.tsx
          button.tsx
          card.tsx
        Navbar.tsx
      constant/
        index.ts
      features/
        auth/
          components/
            LoginPage.tsx
          hooks/
            useAuth.ts
          services/
            authService.ts
          types/
            index.ts
        contact/
          components/
            ContactPage.tsx
        dashboard/
          components/
            DashboardPage.tsx
            UserDetailModal.tsx
            UsersPage.tsx
          hooks/
            useStores.ts
            useUsers.ts
          services/
            storeService.ts
            userService.ts
          types/
            index.ts
        home/
          components/
            HomePage.tsx
        klerek/
          components/
            DetailPage.tsx
            SummaryPage.tsx
          hooks/
            useUploadPos.ts
          services/
            uploadService.ts
          types/
            response.ts
        payment/
          components/
            MembershipPage.tsx
          hooks/
            usePayment.ts
          services/
            paymentService.ts
          types/
            request.ts
            response.ts
          utils/
            subscription.ts
        profile/
          components/
            ProfilePage.tsx
        referral/
          components/
            ReferPage.tsx
      hooks/
        useAppSearchParams.ts
        useCountdown.ts
        useIsActivePath.ts
        useUpload.ts
      lib/
        apiClient.ts
        authGuard.ts
        queryClient.ts
        session.ts
        utils.ts
      utils/
        avatar.ts
        format.ts
      config.ts
      index.css
      main.tsx
    .env.example
    .gitignore
    components.json
    eslint.config.js
    index.html
    package.json
    tsconfig.app.json
    tsconfig.json
    tsconfig.node.json
    vercel.json
    vite.config.ts
.env.example
.gitignore
.prettierrc
.repomixignore
Makefile
package.json
pnpm-workspace.yaml
README.md
repomix.config.json
todo.md
````

# Files

## File: apps/api/public/robot.txt
````

````

## File: apps/api/src/features/store/helper.ts
````typescript
export const isValidStoreID = (s: string): boolean =>
````

## File: apps/api/.gitignore
````
# dev
.yarn/
!.yarn/releases
.vscode/*
!.vscode/launch.json
!.vscode/*.code-snippets
.idea/workspace.xml
.idea/usage.statistics.xml
.idea/shelf

# deps
node_modules/

# env
.env
.env.production

# logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# misc
.DS_Store
.vercel

.vercel
````

## File: apps/api/README.md
````markdown
Prerequisites:

- [Vercel CLI](https://vercel.com/docs/cli) installed globally

To develop locally:

```
npm install
vc dev
```

```
open http://localhost:3000
```

To build locally:

```
npm install
vc build
```

To deploy:

```
npm install
vc deploy
```
````

## File: apps/api/server.ts
````typescript
import { serve } from "@hono/node-server";
import app from "./src/index.js";
````

## File: apps/api/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "outDir": "./dist"
  },
  "exclude": ["node_modules"]
}
````

## File: apps/web/eslint.config.js
````javascript

````

## File: apps/web/tsconfig.node.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
````

## File: apps/web/vite.config.ts
````typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
````

## File: .repomixignore
````
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
node_modules
.vercel
.env
.env*.local
.claude
design
drizzle
docs
dist
env.sh
deploy.sh
apps/web/what-to-rewrite.md
apps/api/src/db/migrate-from-supabase.ts
apps/web/README.md
````

## File: package.json
````json
{
  "name": "new-klerek",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "packageManager": "pnpm@10.33.0"
}
````

## File: README.md
````markdown
RUN ON LOCAL

```bash
vc dev
```

this will run the apps/api
````

## File: repomix.config.json
````json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "repomix-output.md",
    "style": "markdown",
    "filePathStyle": "target-relative",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": true,
    "topFilesLength": 10,
    "showLineNumbers": true,
    "truncateBase64": false,
    "copyToClipboard": false,
    "includeFullDirectoryStructure": false,
    "tokenCountTree": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false,
      "includeLogs": false,
      "includeLogsCount": 50
    },
    "patterns": [{
      "pattern": "**/*.svg",
      "directoryStructureOnly": true
    }]
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDotIgnore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
````

## File: apps/api/src/constant/price.ts
````typescript
interface SubscriptionPackage {
  price: number;
  time: number;
  bonus?: number;
  name: string;
  desc: string;
  badge?: 'POPULER' | 'HEMAT';
}
````

## File: apps/api/src/constant/time.ts
````typescript

````

## File: apps/api/src/features/auth/utils.test.ts
````typescript
import { describe, it } from "node:test"
import { getUsernameFromEmail } from "./utils.js";
import { equal } from "node:assert";
````

## File: apps/api/src/features/clerek/type.ts
````typescript
export interface Row {
  user_id: string;
  cash: number;
  change_pay: number;
  faktur: string;
  bill_no: string;
  sort_no: number;
  plu: number;
  qty: number;
  no_member: string;
  member_name: string;
  branch_id: string | undefined;
  store_id: string;
  store_name: string | undefined;

  date_tx: string;
  time_tx: string;
  phone: string;
  header: string;
  body: string;
  addtl: string;
  footer: string;
}
⋮----
export interface Item {
    sort_no: number;
    plu: number;
    qty: number;
}
⋮----
export interface Data {
    member: {
        phone: string;
        no_member: string;
        member_name: string;
    };
    faktur: {
        bill_no: string;
        no_faktur: string;
    };
    cash: number;
    items: Item[];
    time_tx: string;
    header: string;
    body: string;
    addtl: string;
    footer: string;
}
export interface Summary {
    branch_id: string;
    store_id: string;
    store_name: string;
    user_id: string;
    date_tx: string;
    data: Data[];
    total_faktur: number;
}
````

## File: apps/api/src/features/user/util.ts
````typescript
export const generateReferralCode = ()
````

## File: apps/api/src/types/jwt.ts
````typescript
import type { JwtPayload } from "jsonwebtoken";
⋮----
export interface JwtClaims extends JwtPayload {
  readonly store_id?: string;
  readonly sub?: string;
  readonly name?: string;
  readonly role?: "superadmin" | "admin" | "user";
  readonly type?: "access" | "refresh";
}
````

## File: apps/api/src/types/response.ts
````typescript
export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string | null;
  page?: Page;
}
⋮----
interface Page {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}
````

## File: apps/api/src/utils/googleAuth.ts
````typescript
import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";
import { Exception } from "../error.js";
⋮----
// Module scope agar cache JWKS bertahan antar warm invocation di serverless
⋮----
export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}
⋮----
export const verifyGoogleIdToken = async (credential: string): Promise<GoogleProfile> =>
````

## File: apps/api/.env.example
````
DATABASE_URL=postgresql://postgres:password@localhost:5432/klerek

# Database lama (Supabase), hanya dipakai saat migrasi data satu kali:
#   pnpm --filter api exec tsx ./src/db/migrate-from-supabase.ts
# Boleh dihapus setelah cutover selesai.
SUPABASE_DATABASE_URL=
JWT_SECRET=tidakadayangbenaratausalahhanyasebabdanakibat
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
CORS_ORIGIN=http://localhost:5173

# Google SSO
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
# Role bersifat DB-authoritative — tidak ada whitelist email di sini.
# Superadmin pertama dibuat via seed bootstrap:
#   pnpm --filter api exec tsx ./src/db/seed.ts you@mail.com

# Saweria — payment gateway (endpoint internal backend.saweria.co)
SAWERIA_BASE_URL=https://backend.saweria.co
# User ID akun Saweria penerima donasi (nilai tetap)
SAWERIA_USER_ID=
# Shared secret webhook — set URL webhook di dashboard Saweria:
#   https://api.klerek.my.id/payment/webhook?token=<SAWERIA_WEBHOOK_TOKEN>
SAWERIA_WEBHOOK_TOKEN=
````

## File: apps/api/drizzle.config.ts
````typescript
import { defineConfig } from "drizzle-kit";
````

## File: apps/web/src/app/providers/AppProviders.tsx
````typescript
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "@/lib/queryClient";
import { config } from "@/config";
⋮----
export interface AppProvidersProps {
  children: React.ReactNode;
}
⋮----
export function AppProviders(
````

## File: apps/web/src/constant/index.ts
````typescript
interface SubscriptionPackage {
  price: number;
  time: number;
  bonus?: number;
  name: string;
  desc: string;
  badge?: 'POPULER' | 'HEMAT';
}
````

## File: apps/web/src/features/auth/components/LoginPage.tsx
````typescript
import { useState } from "react";
import { Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useGoogleLoginMutation,
  usePasswordLoginMutation,
} from "@/features/auth/hooks/useAuth";
⋮----
const handlePasswordLogin = async (e: React.FormEvent) =>
⋮----
const handleGoogleSuccess = (credential?: string) =>
⋮----
{/* Header */}
⋮----
{/* Main content */}
⋮----
{/* Lock icon */}
⋮----
{/* Form Username & Password */}
⋮----
{/* Pembatas / Divider */}
⋮----
{/* Google Login */}
⋮----
{/* Status Loading Umum & Error */}
⋮----
{/* Footer */}
````

## File: apps/web/src/features/contact/components/ContactPage.tsx
````typescript
const ContactPage = () =>
````

## File: apps/web/src/features/dashboard/components/UserDetailModal.tsx
````typescript
import { getCurrentUser } from "@/lib/session";
import { useState } from "react";
import { useUserDetailQuery } from "../hooks/useUsers";
import { ChevronRight, ShieldCheck, Store, UserIcon, X } from "lucide-react";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { ROLE_COLOR, ROLE_LABEL } from "./UsersPage";
import { formatDate, formatRupiah } from "@/utils/format";
type ModalView = "detail" | "adjust";
⋮----
// interface AdjustState {
//   type: "credit" | "debit";
//   amount: string;
//   note: string;
//   submitting: boolean;
//   error: string | null;
//   done: boolean;
// }
⋮----
// onBalanceChanged,
⋮----
// const [detail, setDetail] = useState<AdminUserDetail | null>(null);
// const [loading, setLoading] = useState(true);
// const [adjust, setAdjust] = useState<AdjustState>({
//   type: "credit",
//   amount: "",
//   note: "",
//   submitting: false,
//   error: null,
//   done: false,
// });
// const [pendingRole, setPendingRole] = useState<"admin" | "user" | null>(null);
// const [roleSubmitting, setRoleSubmitting] = useState(false);
// const [roleError, setRoleError] = useState<string | null>(null);
⋮----
// useEffect(() => {
//   fetchUserDetailApi(userId)
//     .then(setDetail)
//     .finally(() => setLoading(false));
// }, [userId]);
⋮----
// const handleRoleChange = async () => {
//   if (!detail || !pendingRole) return;
//   setRoleSubmitting(true);
//   setRoleError(null);
//   try {
//     await updateUserRoleApi(userId, pendingRole);
//     setDetail({ ...detail, role: pendingRole });
//     setPendingRole(null);
//     onBalanceChanged();
//   } catch (err) {
//     setRoleError(err instanceof Error ? err.message : "Gagal mengubah role");
//   } finally {
//     setRoleSubmitting(false);
//   }
// };
⋮----
// const handleAdjustSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   const amount = parseInt(adjust.amount, 10);
//   if (!amount || amount <= 0) return;
//   setAdjust((s) => ({ ...s, submitting: true, error: null }));
//   try {
//     await adjustBalanceApi(userId, adjust.type, amount, adjust.note || undefined);
//     setAdjust((s) => ({ ...s, done: true, submitting: false }));
//     onBalanceChanged();
//     if (detail)
//       setDetail({ ...detail, totalBalance: detail.totalBalance + (adjust.type === "credit" ? amount : -amount) });
//   } catch (err) {
//     setAdjust((s) => ({ ...s, error: err instanceof Error ? err.message : "Gagal", submitting: false }));
//   }
// };
⋮----
{/* Header */}
⋮----
// setAdjust((s) => ({ ...s, done: false, error: null, amount: "", note: "" }));
setView("detail");
⋮----
{/* User info */}
⋮----
{/* Stats */}
⋮----
{/* Referred stores */}
⋮----
{/* Joined */}
⋮----
{/* Role management */}
⋮----
// onClick={() => detail.role !== "user" && setPendingRole("user")}
// disabled={roleSubmitting}
⋮----
// onClick={() => detail.role !== "admin" && setPendingRole("admin")}
// disabled={roleSubmitting}
⋮----
{/* {roleError && <p className="text-sm text-red-500 mt-2">{roleError}</p>} */}
⋮----
{/* {pendingRole && (
                    <div className="mt-3 bg-amber-50 rounded-2xl p-3">
                      <p className="text-xs text-amber-800 mb-2">
                        Ubah role <span className="font-semibold">{detail.name}</span> menjadi{" "}
                        <span className="font-semibold">{ROLE_LABEL[pendingRole]}</span>?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingRole(null);
                            setRoleError(null);
                          }}
                          disabled={roleSubmitting}
                          className="py-2 rounded-xl bg-white text-slate-600 font-semibold text-sm border border-slate-200 disabled:opacity-60"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleRoleChange}
                          disabled={roleSubmitting}
                          className="py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors disabled:opacity-60"
                        >
                          {roleSubmitting ? "Memproses..." : "Ya, ubah"}
                        </button>
                      </div>
                    </div>
                  )} */}
⋮----
{/* Adjust balance button */}
⋮----
{/* {!loading && view === "adjust" && (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              {adjust.done ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Check className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-sm text-slate-700 text-center font-medium">Balance berhasil disesuaikan</p>
                  <button
                    type="button"
                    onClick={() => {
                      setView("detail");
                      setAdjust((s) => ({ ...s, done: false, amount: "", note: "" }));
                    }}
                    className="text-sm text-indigo-500 font-medium"
                  >
                    Kembali ke detail
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjust((s) => ({ ...s, type: "credit" }))}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${adjust.type === "credit" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 text-slate-500"}`}
                    >
                      <Plus className="w-4 h-4" /> Kredit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjust((s) => ({ ...s, type: "debit" }))}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${adjust.type === "debit" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-100 text-slate-500"}`}
                    >
                      <Minus className="w-4 h-4" /> Debit
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                      Jumlah (IDR)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={adjust.amount}
                      onChange={(e) => setAdjust((s) => ({ ...s, amount: e.target.value }))}
                      placeholder="contoh: 50000"
                      required
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                      Catatan (opsional)
                    </label>
                    <input
                      type="text"
                      value={adjust.note}
                      onChange={(e) => setAdjust((s) => ({ ...s, note: e.target.value }))}
                      placeholder="alasan penyesuaian"
                      maxLength={255}
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                    />
                  </div>

                  {adjust.error && <p className="text-sm text-red-500">{adjust.error}</p>}

                  <button
                    type="submit"
                    disabled={adjust.submitting || !adjust.amount}
                    className={`w-full py-3 rounded-2xl font-semibold text-sm text-white transition-colors disabled:opacity-60 ${adjust.type === "credit" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-400 hover:bg-red-500"}`}
                  >
                    {adjust.submitting
                      ? "Memproses..."
                      : `${adjust.type === "credit" ? "Tambah" : "Kurangi"} ${adjust.amount ? formatRupiah(parseInt(adjust.amount) || 0) : "Balance"}`}
                  </button>
                </>
              )}
            </form>
          )} */}
````

## File: apps/web/src/features/home/components/HomePage.tsx
````typescript
import { useRef, useState, type DragEvent } from "react";
import { Upload, ChevronRight, Sparkles, FileArchive } from "lucide-react";
import { useUpload, getRecentUploads } from "@/hooks/useUpload";
import { timeAgo } from "@/utils/format";
⋮----
const handleFile = (f: File)
⋮----
const handleDrop = (e: DragEvent<HTMLDivElement>) =>
⋮----
const pickFile = ()
⋮----
{/* ── Mobile content ── */}
⋮----
{/* Mobile upload card */}
⋮----
{/* Promo card */}
⋮----
{/* Cara kerja */}
⋮----
{/* ── Desktop content ── */}
⋮----
{/* Hero */}
⋮----
{/* todo : get total toko ke server lalu kasih animasi counting */}
⋮----
{/* Desktop upload card */}
⋮----
e.preventDefault();
⋮----
{/* <span className="bg-slate-100 rounded px-1.5 py-0.5">.zip</span> */}
⋮----
{/* <span>SQLite di dalam</span> */}
⋮----
onClick=
⋮----
{/* <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>File diproses lokal di browser. Tidak disimpan di server.</span>
          </div> */}
````

## File: apps/web/src/features/klerek/services/uploadService.ts
````typescript
import { apiClient } from "@/lib/apiClient";
import type { Summary } from "../types/response";
⋮----
export async function uploadPosFileApi(file: File): Promise<Summary>
````

## File: apps/web/src/features/klerek/types/response.ts
````typescript
import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";
⋮----
export type Summary = NonNullable<InferResponseType<typeof apiClient.index.$post>['data']>
````

## File: apps/web/src/features/payment/types/request.ts
````typescript
import type { apiClient } from "@/lib/apiClient";
import type { InferRequestType } from "hono";
⋮----
export type GeneratePaymentInput = InferRequestType<typeof apiClient.payment.generate.$post>['json']
````

## File: apps/web/src/features/payment/types/response.ts
````typescript
import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";
⋮----
export type PaymentResponse = NonNullable<InferResponseType<typeof apiClient.payment.generate.$post>['data']>
````

## File: apps/web/src/features/payment/utils/subscription.ts
````typescript
import type { StoreResponse } from "@/features/dashboard/types";
import { formatDate, formatRupiah, timeAgo } from "@/utils/format";
⋮----
type Subs = StoreResponse["subs"];
⋮----
// ── Paket (dataPrice: time & bonus dalam detik) ──────────────────────────────
⋮----
/** Total hari sebuah paket, termasuk bonus. */
export function packageDays(time: number, bonus = 0): number
⋮----
/** 2_592_000 → "1 Bulan", 604_800 → "7 Hari" */
export function formatPackageDuration(time: number, bonus = 0): string
⋮----
/** "setara Rp 1.000/hari" */
export function formatPerDayPrice(price: number, time: number, bonus = 0): string
⋮----
/** "5 Jan 2026 – 4 Feb 2026" — rentang aktif jika paket dibeli hari ini. */
export function formatProjectedRange(totalDays: number): string
⋮----
// ── Status subscription toko ────────────────────────────────────────────────
⋮----
export type SubStatus = "aktif" | "trial" | "habis";
⋮----
export function getActiveSub(subs: Subs)
⋮----
export function getSubStatus(subs: Subs): SubStatus
⋮----
/** Label jenis paket aktif berdasarkan durasinya: "Trial", "Bulanan", …, atau "Habis". */
export function getSubLabel(subs: Subs): string
⋮----
/** "Aktif hingga 5 Jan 2026" atau "Tidak aktif" */
export function formatActiveUntil(subs: Subs): string
⋮----
/** "berakhir dalam 5 hari" / "habis 3 hari yang lalu" / "belum ada langganan" */
export function formatExpiryRelative(subs: Subs): string
⋮----
// API /store hanya mengirim subscription dengan expiresAt paling akhir
````

## File: apps/web/src/features/profile/components/ProfilePage.tsx
````typescript
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProfileQuery, useLogoutMutation } from "@/features/auth/hooks/useAuth";
import { formatDate, formatRupiah } from "@/utils/format";
import {
  User,
  Copy,
  Check,
  Store,
  LogOut,
  ChevronRight,
  GitBranch,
  CalendarDays,
  BadgeCheck,
  Wallet,
} from "lucide-react";
⋮----
const handleCopy = () =>
⋮----
const handleLogout = async () =>
````

## File: apps/web/src/features/referral/components/ReferPage.tsx
````typescript
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, Check, ArrowLeft, Store } from "lucide-react";
import { useSubmitReferralMutation } from "@/features/dashboard/hooks/useStores";
⋮----
interface SuccessState {
  storeName: string;
  referrerName: string;
}
⋮----
export default function ReferPage()
⋮----
const handleSubmit = async (e: React.FormEvent) =>
````

## File: apps/web/src/hooks/useAppSearchParams.ts
````typescript
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
⋮----
export function useAppSearchParams()
````

## File: apps/web/src/hooks/useCountdown.ts
````typescript
import { useEffect, useState } from "react";
⋮----
/** Hitung mundur per detik dari `secs` sampai 0. `str` berformat "mm:ss". */
export function useCountdown(secs: number)
````

## File: apps/web/src/hooks/useIsActivePath.ts
````typescript
import { useLocation, type RegisteredRouter } from "@tanstack/react-router";
⋮----
type AppPathname = keyof RegisteredRouter["routesByPath"];
export function useIsActivePath(...paths: AppPathname[])
````

## File: apps/web/src/lib/apiClient.ts
````typescript
import { config } from "@/config";
import type { AppType } from "@apps/api";
import { hc } from "hono/client";
````

## File: apps/web/src/lib/queryClient.ts
````typescript
import { QueryClient } from "@tanstack/react-query";
⋮----
staleTime: 1000 * 60 * 5, // 5 menit
````

## File: apps/web/src/lib/utils.ts
````typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
⋮----
export function cn(...inputs: ClassValue[])
````

## File: apps/web/src/utils/avatar.ts
````typescript
/** "Toko Maju — Cabang 2" → "TM" */
export function getInitials(name: string): string
⋮----
/** Kelas warna background Tailwind yang deterministik per id (id sama → warna sama). */
export function getAvatarColor(id: string): string
````

## File: apps/web/src/utils/format.ts
````typescript
/** 15000 → "Rp 15.000" */
export function formatRupiah(amount: number): string
⋮----
/**
 * Tanggal lokal Indonesia.
 * - "long"  → "5 Januari 2026"
 * - "short" → "5 Jan 2026"
 */
export function formatDate(date: Date | string, month: "long" | "short" = "long"): string
⋮----
/** "5 Januari 2026 · Senin". String tanggal tidak valid dikembalikan apa adanya. */
export function formatDateWithDay(date: Date | string): string
⋮----
/**
 * Waktu relatif dua arah:
 * masa lalu → "3 hari yang lalu" / "kemarin", masa depan → "dalam 5 hari" / "besok".
 */
export function timeAgo(date: Date | string): string
````

## File: apps/web/src/index.css
````css
@theme {
⋮----
body {
````

## File: apps/web/.env.example
````
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=409565515945-s8f69m4o5b779024uepccvhctrr0oesl.apps.googleusercontent.com
````

## File: apps/web/.gitignore
````
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.env.production
````

## File: apps/web/index.html
````html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Klerek App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
````

## File: apps/web/tsconfig.app.json
````json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2023",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path aliases */
    // "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
````

## File: apps/web/vercel.json
````json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
````

## File: .prettierrc
````
{
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 120
}
````

## File: pnpm-workspace.yaml
````yaml
packages:
  - "apps/*"
allowBuilds:
  better-sqlite3: true
  esbuild: true
  sharp: true
  workerd: true
````

## File: apps/api/src/features/auth/utils.ts
````typescript
import crypto from "node:crypto";
⋮----
export const getUsernameFromEmail = (email: string) =>
⋮----
/**
 * 1. Fungsi untuk melakukan HASH password
 * @param password Password teks polos dari user
 * @returns String hasil gabungan salt dan hash untuk disimpan di database
 */
export async function hashPassword(password: string): Promise<string>
⋮----
// Membuat salt acak sepanjang 16 bytes (32 karakter hex)
⋮----
// Menggunakan scrypt untuk mengamankan password
⋮----
// Gabungkan salt dan hash dengan titik (.) agar muat dalam 1 kolom database
⋮----
/**
 * 2. Fungsi untuk meng-COMPARE / memverifikasi password
 * @param password Password teks polos yang diinput saat login
 * @param storedHash String hash yang diambil dari database (format: salt.hash)
 * @returns Boolean true jika cocok, false jika salah
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean>
⋮----
// Pisahkan kembali salt dan hash asli menggunakan pemisah '.'
⋮----
return resolve(false); // Format hash cacat atau tidak valid
⋮----
// Hash ulang password input dengan salt dari database
⋮----
// Mengubah string hex ke bentuk Buffer agar bisa dibandingkan dengan aman
⋮----
// Proteksi awal jika panjang karakter berbeda
⋮----
// timingSafeEqual wajib digunakan untuk mencegah Timing Attacks
````

## File: apps/api/src/features/clerek/helper.ts
````typescript
import type { Row, Data, Summary } from './type.js';
import { Exception } from '../../error.js';
⋮----
export const parseFakturPrefix = (d: string): string =>
⋮----
export const mapToResponseObject = (rows: Row[]): Summary =>
⋮----
export const isValidUserID = (s: string) =>
⋮----
// nama file memakai format tanggal YYYY-MM-DD
export const isValidDateTX = (s: string) =>
````

## File: apps/api/src/features/clerek/service.ts
````typescript
import AdmZip from "adm-zip";
import BetterSqlite3 from "better-sqlite3";
import { isValidDateTX, isValidUserID, mapToResponseObject, parseFakturPrefix, query } from "./helper.js";
import type { Row, Summary } from "./type.js";
import { Exception } from "../../error.js";
import { isValidStoreID } from "../store/helper.js";
import { db } from "../../db/client.js";
import { dailySummary } from "../../db/schema.js";
import { sql } from "drizzle-orm";
⋮----
interface DBParams {
  buffer: Buffer;
  userID: string;
  storeID: string;
  /** prefix DDMM untuk filter faktur di SQLite */
  dateFx: string;
  /** tanggal transaksi asli dari nama file, format YYYY-MM-DD */
  dateTX: string;
}
⋮----
/** prefix DDMM untuk filter faktur di SQLite */
⋮----
/** tanggal transaksi asli dari nama file, format YYYY-MM-DD */
⋮----
export const prepareDbBuffer = async (file: File | string): Promise<DBParams> =>
⋮----
export const initAndValidateDB = (buffer: Buffer): BetterSqlite3.Database =>
⋮----
export const processDB = (db: BetterSqlite3.Database, userID: string, fakturPrefix: string) =>
⋮----
interface SaveDailySummaryParams {
  storeId: string;
  userId: string;
  /** tanggal transaksi dari nama file, format YYYY-MM-DD */
  dateTx: string;
  summary: Summary;
}
⋮----
/** tanggal transaksi dari nama file, format YYYY-MM-DD */
⋮----
// Upsert rekap harian per (toko, kasir, tanggal). Upload ulang hari yang sama menimpa angka lama.
export const saveDailySummary = async (
⋮----
// NB: `summary.total_faktur` di helper sebenarnya akumulasi cash, bukan jumlah faktur
````

## File: apps/api/src/features/store/validator.ts
````typescript
import z from "zod";
import { validator } from "hono/validator";
import type { ApiResponse } from "../../types/response.js";
````

## File: apps/api/src/features/subscription/data.ts
````typescript
export interface SubscriptionPackage {
  price: number;
  time: number;
  bonus?: number;
  name: string;
  desc: string;
  badge?: 'POPULER' | 'HEMAT';
}
````

## File: apps/api/src/features/subscription/service.ts
````typescript
import { time } from "../../constant/time.js";
import { db } from "../../db/client.js";
import { subscription, type SubscriptionInsert } from "../../db/schema.js";
import { sendLog } from "../../utils/telegram.js";
⋮----
export const addSubscription = async (data: SubscriptionInsert) =>
⋮----
export const startTrial = async (storeId: string) =>
⋮----
// todo : ganti jadi notif ke bot kalau insert trial gagal
````

## File: apps/api/src/features/user/service.ts
````typescript
import { count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, store, balance } from "../../db/schema.js";
import { Exception } from "../../error.js";
⋮----
import { hashPassword } from "../auth/utils.js";
import { generateReferralCode } from "./util.js";
import type { BalanceAdjustInput, CreateUserInput, RoleUpdateInput } from "./validator.js";
⋮----
export const generateUniqueReferralCode = async () =>
⋮----
interface ListUsersQuery {
  limit: number;
  offset: number;
  q?: string;
}
⋮----
export const listUsers = async (
⋮----
export const getUserDetail = async (userId: string) =>
⋮----
export const adjustUserBalance = async (userId: string, input: BalanceAdjustInput) =>
⋮----
export const updateUserRole = async (userId: string, input: RoleUpdateInput) =>
⋮----
// Role superadmin dilindungi: hanya lewat seed bootstrap, tidak lewat panel.
⋮----
export const createUser = async (input: CreateUserInput) =>
⋮----
export const getBalanceHistory = async (userId: string) =>
⋮----
export const getProfile = async (userId: string) =>
````

## File: apps/api/src/utils/telegram.ts
````typescript
import { config } from "../config.js";
⋮----
const telegramUrl = () =>
⋮----
export const sendLog = async (message: string): Promise<void> =>
⋮----
export const pingTelegram = async (): Promise<boolean> =>
````

## File: apps/web/src/app/routes/router.tsx
````typescript
import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import HomePage from "@/features/home/components/HomePage";
import SummaryPage from "@/features/klerek/components/SummaryPage";
import DetailPage from "@/features/klerek/components/DetailPage";
import LoginPage from "@/features/auth/components/LoginPage";
import ProfilePage from "@/features/profile/components/ProfilePage";
import DashboardPage from "@/features/dashboard/components/DashboardPage";
import MembershipPage from "@/features/payment/components/MembershipPage";
import ReferPage from "@/features/referral/components/ReferPage";
import UsersPage from "@/features/dashboard/components/UsersPage";
import ContactPage from "@/features/contact/components/ContactPage";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  requireAuthGuard,
  requireSuperadminGuard,
  redirectIfAuthenticatedGuard,
} from "@/lib/authGuard";
⋮----
// Root Route
⋮----
// Layout Public
⋮----
// Layout Admin (Protected)
⋮----
// Auth Route
⋮----
// Route Tree
⋮----
interface Register {
    router: typeof router;
  }
````

## File: apps/web/src/features/auth/types/index.ts
````typescript

````

## File: apps/web/src/features/dashboard/components/DashboardPage.tsx
````typescript
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import {
  Bell,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  X,
  Store as StoreIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  STORE_PAGE_LIMIT,
  subscribeStoreApi,
} from "@/features/dashboard/services/storeService";
import type {
  StoreStatusFilter,
} from "@/features/dashboard/types";
import { getCurrentUser } from "@/lib/session";
import { logoutApi } from "@/features/auth/services/authService";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { formatDate, formatRupiah } from "@/utils/format";
import {
  formatActiveUntil,
  formatExpiryRelative,
  formatPackageDuration,
  getActiveSub,
  getSubLabel,
  getSubStatus,
} from "@/features/payment/utils/subscription";
import { cn } from "@/lib/utils";
import { useStoresQuery } from "../hooks/useStores";
import { dataPrice } from "../../../constant";
⋮----
function SkeletonStoreItem()
⋮----
export function parseStoreStatus(value: string | null): StoreStatusFilter | undefined
⋮----
// const [stores, setStores] = useState<StoreListData>({ data: [], page: undefined });
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);
⋮----
// const loadData = useCallback(async () => {
//   setLoading(true);
//   setError(null);
//   try {
//     const res = await fetchStorePageApi({ q: q || undefined, status, offset });
//     setStores(res);
//   } catch (err) {
//     if (err instanceof Response && err.status >= 300 && err.status < 400) {
//       if (config.ENV == "production") navigate({ to: "/auth/login" });
//       return;
//     }
//     setError("Gagal memuat data toko.");
//   } finally {
//     setLoading(false);
//   }
// }, [q, status, offset, navigate]);
⋮----
// useEffect(() => {
//   setSearch(q);
//   loadData();
// }, [q, status, offset, loadData]);
⋮----
const handleOpenModal = (store: typeof stores['data'][number]) =>
⋮----
const handleCloseModal = () =>
⋮----
const handleSubscribe = async () =>
⋮----
const applyQuery = (next:
⋮----
const handleSearch = (e: React.FormEvent) =>
⋮----
const handleClearSearch = () =>
⋮----
const handleStatusChange = (next: StoreStatusFilter | undefined) =>
⋮----
const handlePageChange = (newOffset: number) =>
⋮----
{/* Non-scrollable Top Content */}
⋮----
{/* Header */}
⋮----
onClick=
⋮----
{/* Stats Cards */}
⋮----
{/* Control Bar */}
⋮----
className=
⋮----
{/* Scrollable Table Section Only */}
⋮----
{/* Fixed Bottom Pagination Bar */}
⋮----
{/* Modal Subscribe */}
````

## File: apps/web/src/features/dashboard/components/UsersPage.tsx
````typescript
import { useState } from "react";
import { useAppSearchParams } from "@/hooks/useAppSearchParams";
import { Search, X, ChevronRight } from "lucide-react";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { formatRupiah } from "@/utils/format";
import { UserDetailModal } from "./UserDetailModal";
import { useUsersQuery } from "../hooks/useUsers";
⋮----
function SkeletonUserItem()
⋮----
// const [users, setUsers] = useState<AdminUserItem[]>([]);
// const [page, setPage] = useState<ApiResponse["page"] | null>(null);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);
⋮----
// const loadData = async (isAppend = false) => {
//   setLoading(true);
//   setError(null);
//   try {
//     const res = await fetchUsersApi({ offset, q });
//     setUsers((prev) => (isAppend ? [...prev, ...res.data] : res.data));
//     setPage(res.page);
//   } catch (err) {
//     setError(err instanceof Error ? err.message : "Gagal memuat data");
//   } finally {
//     setLoading(false);
//   }
// };
⋮----
// useEffect(() => {
//   setSearch(q);
//   loadData(offset > 0);
// }, [offset, q]);
⋮----
const handleSearch = (e: React.SubmitEvent) =>
⋮----
const handleLoadMore = () =>
⋮----
{/* Header */}
⋮----
{/* <p className="text-sm text-slate-400 mt-0.5">{page?.total ?? users.length} pengguna terdaftar</p> */}
⋮----
{/* Search */}
⋮----
setSearch("");
setSearchParams(
⋮----
{/* List */}
⋮----
{/* Detail modal */}
⋮----
onBalanceChanged=
````

## File: apps/web/src/features/dashboard/hooks/useStores.ts
````typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreQuery } from "../types";
import {
  fetchStorePageApi,
  fetchStorePublicApi,
  submitReferralApi,
  subscribeStoreApi,
} from "../services/storeService";
⋮----
export function useStoresQuery(query: StoreQuery)
⋮----
export function useStorePublicQuery(id: string)
⋮----
export function useSubmitReferralMutation()
⋮----
export function useSubscribeStoreMutation()
````

## File: apps/web/src/features/dashboard/hooks/useUsers.ts
````typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserQuery } from "../types";
import { fetchUsersApi, fetchUserDetailApi, updateUserRoleApi, adjustBalanceApi } from "../services/userService";
⋮----
export function useUsersQuery(query: UserQuery)
⋮----
export function useUserDetailQuery(userId: string)
⋮----
export function useUpdateUserRoleMutation()
⋮----
export function useAdjustBalanceMutation()
````

## File: apps/web/src/features/dashboard/services/userService.ts
````typescript
import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/session";
import type { UserQuery } from "../types";
⋮----
export async function fetchUsersApi({
  offset = 0,
  q = "",
}: UserQuery)
⋮----
export async function fetchUserDetailApi(
  userId: string,
)
⋮----
export async function updateUserRoleApi(
  userId: string,
  role: "admin" | "user",
): Promise<void>
⋮----
export async function adjustBalanceApi(
  userId: string,
  type: "credit" | "debit",
  amount: number,
  note?: string,
): Promise<void>
````

## File: apps/web/src/features/klerek/components/DetailPage.tsx
````typescript
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { formatRupiah } from "@/utils/format";
import type { Summary } from "../types/response";
⋮----
function extractKasir(header: string | null): string
⋮----
type FilterTab = "semua" | "member";
⋮----
const handleFilterChange = (f: FilterTab) =>
⋮----
onClick=
⋮----
onChange=
````

## File: apps/web/src/features/klerek/components/SummaryPage.tsx
````typescript
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Download, CalendarDays, Users, Receipt, Package, Gift } from "lucide-react";
import { formatDateWithDay, formatRupiah } from "@/utils/format";
import { useState, useEffect } from "react";
import type { Summary } from "../types/response";
⋮----
{/* Mobile content */}
⋮----
{/* Desktop content */}
````

## File: apps/web/src/features/klerek/hooks/useUploadPos.ts
````typescript
import { useMutation } from "@tanstack/react-query";
import { uploadPosFileApi } from "../services/uploadService";
⋮----
export function useUploadMutation()
````

## File: apps/web/src/features/payment/components/MembershipPage.tsx
````typescript
import { useEffect, useRef, useState } from "react";
import { generateQrisApi, checkPaymentApi } from "@/features/payment/services/paymentService";
import { fetchStorePublicApi } from "@/features/dashboard/services/storeService";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, CheckCircle, Download, Info, Mail, QrCode, Search, Zap } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { formatRupiah } from "@/utils/format";
import { formatPerDayPrice, formatProjectedRange, packageDays } from "@/features/payment/utils/subscription";
import { dataPrice } from "../../../constant";
import type { PaymentResponse } from "../types/response";
⋮----
type StoreRef = { id: string; name: string };
⋮----
// Default toko diambil dari summary upload terakhir (jika ada)
function getStoreFromSession(): StoreRef | null
⋮----
type PollStatus = "polling" | "paid" | "expired";
⋮----
// ── QRIS full-screen view ────────────────────────────────────────────────────
⋮----
// QR di-render lokal dari qr_string Saweria — simpan = export canvas ke PNG
const handleSaveQr = () =>
⋮----
{/* Desktop navbar */}
⋮----
{/* Mobile header */}
⋮----
{/* Mobile layout */}
⋮----
{/* Store + package info */}
⋮----
{/* QRIS card */}

⋮----
{/* Timer */}
⋮----
{/* Mobile sticky CTA */}
⋮----
{/* Desktop two-column layout */}
⋮----
{/* Left */}
⋮----
{/* Right */}
⋮----
// ── Package selection view ───────────────────────────────────────────────────
⋮----
// Email wajib untuk Saweria — dipakai sebagai identitas donatur
⋮----
const stopPolling = () =>
⋮----
/* keep polling on transient errors */
⋮----
const handleCheckNow = async () =>
⋮----
/* ignore */
⋮----
const handlePilih = async (idx: number) =>
⋮----
const handleLookupStore = async (e: React.FormEvent) =>
⋮----
const handleBack = () =>
⋮----
const renderEmailInput = (className = "") => (
    <div className={className}>
      <div className="relative">
        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="email"
          value={email}
onChange=
⋮----
setEmail(e.target.value);
setEmailError("");
⋮----
{/* ── Mobile header ── */}
⋮----
{/* ── Mobile heading + subtitle ── */}
⋮----
{/* ── Mobile store input ── */}
⋮----
{/* ── Mobile email input ── */}
⋮----
{/* ── Desktop heading ── */}
⋮----
{/* ── Mobile: radio list ── */}
⋮----
{/* Radio indicator */}
⋮----
{/* Name + desc */}
⋮----
{/* Price + duration */}
⋮----
{/* Mobile info note */}
⋮----
{/* ── Desktop: card scroll ── */}
⋮----
{/* Desktop info sections */}
⋮----
{/* ── Mobile sticky CTA ── */}
⋮----
onClick=
````

## File: apps/web/src/features/payment/hooks/usePayment.ts
````typescript
import { useMutation, useQuery } from "@tanstack/react-query";
import { generateQrisApi, checkPaymentApi } from "../services/paymentService";
import type { GeneratePaymentInput } from "../types/request";
⋮----
export function useGenerateQrisMutation()
⋮----
export function usePaymentStatusQuery(invoiceId: string, enabled = false)
````

## File: apps/web/src/features/payment/services/paymentService.ts
````typescript
import { apiClient } from "@/lib/apiClient";
import type { GeneratePaymentInput } from "../types/request";
import type { PaymentResponse } from "../types/response";
⋮----
export async function generateQrisApi(input: GeneratePaymentInput): Promise<PaymentResponse>
⋮----
export async function checkPaymentApi(invoiceId: string): Promise<PaymentResponse>
````

## File: apps/web/src/main.tsx
````typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
⋮----
import { router } from "./app/routes/router";
import { AppProviders } from "./app/providers/AppProviders";
````

## File: apps/web/tsconfig.json
````json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    // "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
````

## File: .gitignore
````
node_modules
.vercel
.env
.env*.local
.claude
````

## File: Makefile
````makefile
.PHONY: dev dev-api dev-web deploy deploy-api deploy-web migrate-run migrate-gen env-list env-push env-pull

dev:
	pnpm --filter @apps/api dev & pnpm --filter @apps/web dev

dev-api:
	pnpm --filter @apps/api dev

dev-web:
	pnpm --filter @apps/web dev

deploy:
	./deploy.sh all

deploy-api:
	./deploy.sh api

deploy-web:
	./deploy.sh web

migrate-run:
	pnpm --filter @apps/api migration:run

migrate-gen:
	pnpm --filter @apps/api migration:generate

# Env Vercel — APP=api|web (default: api). Contoh: make env-push APP=web
APP ?= api

env-list:
	./env.sh $(APP) list

env-push:
	./env.sh $(APP) push

env-pull:
	./env.sh $(APP) pull
````

## File: apps/api/src/db/seed.ts
````typescript
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
⋮----
import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { users } from "./schema.js";
⋮----
async function main()
````

## File: apps/api/src/features/payment/validator.ts
````typescript
import { validator } from "hono/validator";
import z from "zod";
import { dataPrice } from "../../constant/price.js";
import type { ApiResponse } from "../../types/response.js";
````

## File: apps/api/src/utils/saweria.ts
````typescript
import { config } from "../config.js";
⋮----
// Endpoint internal Saweria (tidak terdokumentasi resmi) — hasil eksplorasi manual.
// Create: POST {BASE}/donations/snap/{userId} → { data: { id, qr_string, status: "PENDING", ... } }
// Konfirmasi pembayaran datang lewat webhook (lihat SaweriaWebhookPayload), bukan polling.
⋮----
export interface SaweriaDonation {
  id: string;
  qrString: string;
  amount: number;
}
⋮----
interface CreateDonationParams {
  amount: number;
  message: string; // dipakai sebagai catatan agar terlacak di dashboard Saweria
  donatorName: string;
  donatorEmail: string; // diinput kasir di frontend, wajib oleh Saweria
}
⋮----
message: string; // dipakai sebagai catatan agar terlacak di dashboard Saweria
⋮----
donatorEmail: string; // diinput kasir di frontend, wajib oleh Saweria
⋮----
// Body yang dikirim Saweria ke webhook URL setiap ada donasi masuk.
// `id` = donation id = payment.invoiceId di DB kita.
export interface SaweriaWebhookPayload {
  version: string;
  created_at: string;
  id: string;
  type: "donation";
  amount_raw: number;
  cut: number;
  donator_name: string;
  donator_email: string;
  donator_is_user: boolean;
  message?: string;
}
⋮----
export const checkSaweria = async () =>
⋮----
export const createDonation = async (params: CreateDonationParams): Promise<SaweriaDonation> =>
⋮----
// Webhook Saweria tidak punya signature — diamankan dengan shared secret di query string (?token=...)
// yang diset pada URL webhook di dashboard Saweria.
export const verifyWebhookToken = (token: string | undefined): boolean
````

## File: apps/web/src/components/ui/badge.tsx
````typescript
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
⋮----
import { cn } from "@/lib/utils"
⋮----
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
VariantProps<typeof badgeVariants> &
⋮----
className=
````

## File: apps/web/src/components/ui/button.tsx
````typescript
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
⋮----
import { cn } from "@/lib/utils"
⋮----
className=
````

## File: apps/web/src/components/ui/card.tsx
````typescript
import { cn } from "@/lib/utils"
⋮----
className=
````

## File: apps/web/src/features/auth/hooks/useAuth.ts
````typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setAccessToken } from "@/lib/session";
import {
  loginWithGoogleApi,
  loginWithPasswordApi,
  logoutApi,
  getProfileApi,
} from "../services/authService";
⋮----
export function useProfileQuery()
⋮----
export function useGoogleLoginMutation()
⋮----
export function usePasswordLoginMutation()
⋮----
export function useLogoutMutation()
````

## File: apps/web/src/features/auth/services/authService.ts
````typescript
import { apiClient } from "@/lib/apiClient";
import { clearSession, getAccessToken, setAccessToken } from "@/lib/session";
⋮----
export async function loginWithGoogleApi(credential: string)
⋮----
export async function loginWithPasswordApi(payload:
⋮----
export async function logoutApi(): Promise<void>
⋮----
// Ignore error so local session is still cleaned up
⋮----
async function refreshTokenApi(): Promise<string | null>
⋮----
export function refreshAccessToken(): Promise<string | null>
⋮----
export async function getProfileApi()
````

## File: apps/web/src/features/dashboard/services/storeService.ts
````typescript
import { apiClient } from "@/lib/apiClient";
import { config } from "@/config";
import { getAccessToken, clearSession } from "@/lib/session";
import type { StoreQuery, SubscribeResult } from "../types";
⋮----
export async function fetchStorePageApi(
⋮----
export async function fetchStorePublicApi(id: string): Promise<
⋮----
export async function submitReferralApi(
  referralCode: string,
): Promise<
⋮----
export async function subscribeStoreApi(storeId: string, packageIndex: number): Promise<SubscribeResult>
````

## File: apps/web/src/features/dashboard/types/index.ts
````typescript
import type { apiClient } from "@/lib/apiClient";
import type { InferResponseType } from "hono";
⋮----
export type StoreResponse = NonNullable<InferResponseType<typeof apiClient.store.$get>['data']>[number]
⋮----
export interface SubscribeResult {
  subscription: { id: number; storeId: string; createdAt: string; expiresAt: string };
  debitAmount: number;
}
⋮----
export type StoreStatusFilter = "active" | "expired";
⋮----
export interface StoreQuery {
  q?: string;
  status?: StoreStatusFilter;
  offset?: number;
}
⋮----
export interface UserQuery {
  q?: string;
  offset?: number;
}
````

## File: apps/web/src/lib/session.ts
````typescript
import { config } from "@/config";
import type { JwtClaims } from "@apps/api";
⋮----
// key lama — dulu data user disimpan terpisah, sekarang diambil dari claims JWT
⋮----
export type Role = NonNullable<JwtClaims["role"]>;
⋮----
export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
}
⋮----
export function decodeJwt(token: string): JwtClaims | null
⋮----
export function getAccessToken(): string | null
⋮----
export function setAccessToken(token: string)
⋮----
/** Claims access token yang valid (ada role & belum expired), atau null. */
export function getClaims(): JwtClaims | null
⋮----
/**
 * User yang sedang login, dibaca dari claims access token.
 * Tidak mengecek expiry: token yang baru expired tetap berisi identitas yang sama
 * dan akan diperbarui otomatis oleh fetchWithAuth / auth guard.
 */
export function getCurrentUser(): CurrentUser | null
⋮----
export function clearSession()
````

## File: apps/web/components.json
````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
````

## File: .env.example
````
# ── Vercel Deployment ─────────────────────────────────────
# Token: https://vercel.com/account/tokens
VERCEL_TOKEN=

# Org/Team ID — lihat di Vercel dashboard → Settings → General → Team ID
# (untuk personal account, isinya adalah user ID diawali "team_" atau gunakan personal team ID)
VERCEL_ORG_ID=

# Project ID apps/api — Vercel dashboard → project api → Settings → General → Project ID
# PENTING: di Vercel project settings, set "Root Directory" = apps/api
VERCEL_API_PROJECT_ID=

# Project ID apps/web — Vercel dashboard → project web → Settings → General → Project ID
# PENTING: di Vercel project settings, set "Root Directory" = apps/web
VERCEL_WEB_PROJECT_ID=
````

## File: apps/api/src/features/auth/validator.ts
````typescript
import { z } from "zod";
import { validator } from "hono/validator";
import type { ApiResponse } from "../../types/response.js";
⋮----
export type ReferStoreInput = z.infer<typeof referStoreSchema>;
⋮----
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
⋮----
export type LoginAuthInput = z.infer<typeof loginAuthSchema>;
````

## File: apps/api/src/features/user/handler.ts
````typescript
import { Hono } from "hono";
import { adminMiddleware, superAdminMiddleware } from "../auth/middleware.js";
import { listUsers, getUserDetail, adjustUserBalance, updateUserRole, createUser } from "./service.js";
import { Exception } from "../../error.js";
import { balanceAdjustValidator, createUserValidator, roleUpdateValidator } from "./validator.js";
import type { User } from "../../db/schema.js";
import type { ApiResponse } from "../../types/response.js";
import type { JwtClaims } from "../../types/jwt.js";
````

## File: apps/api/src/features/user/validator.ts
````typescript
import { validator } from "hono/validator";
import z from "zod";
import type { ApiResponse } from "../../types/response.js";
⋮----
export type BalanceAdjustInput = z.infer<typeof balanceAdjustSchema>
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
````

## File: apps/api/src/error.ts
````typescript
import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { sendLog } from "./utils/telegram.js";
import type { ApiResponse } from "./types/response.js";
⋮----
export class Exception
⋮----
public static NotFound(m?: string)
⋮----
public static BadRequest(m?: string)
⋮----
public static Validation(m?: string)
⋮----
public static ServerError(m?: string)
⋮----
public static Unauthorized(m?: string)
⋮----
public static Forbidden(m?: string)
⋮----
public static Conflict(m?: string)
⋮----
export const errorHandler: ErrorHandler = async (err, c) =>
⋮----
export const notFoundHandler: NotFoundHandler = (c) =>
````

## File: todo.md
````markdown
# Aneh

## Project
- [x] Migrasiin database ke neon.
- [x] integrasi database neon ke old project.
- [x] migrasi fitur pembayaran dari wijayapay ke saweria backend.

## Feature
- [x] simpan rekap transaksi ke db make sure jangan duplikat
- [x] update implementasi auth akun pake sso google aja.
- [x] tambah satu middleware lagi khusus superadmin. lalu pakai middleware ini untuk ganti authMiddleware yang ada di endpoint cek health config.
````

## File: apps/api/src/features/payment/service.ts
````typescript
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { payment, subscription, store, users, balance, type PaymentInsert } from '../../db/schema.js';
⋮----
// Saweria tidak mengirim expiry QR — payment pending lebih lama dari ini dianggap expired.
// Disamakan dengan countdown di frontend (QRIS_SECS).
⋮----
export const createPendingPayment = async (data: PaymentInsert) =>
⋮----
export const getPaymentByInvoiceId = async (invoiceId: string) =>
⋮----
export const getPaymentsByStoreId = async (storeId: string) =>
⋮----
export const isPaymentExpired = (p:
⋮----
// Payment pending yang masih berlaku untuk (store, nominal) — dipakai ulang agar
// refresh halaman / spam request tidak membuat donasi baru di Saweria.
export const findReusablePendingPayment = async (storeId: string, amount: number) =>
⋮----
// Dipanggil dari webhook Saweria. Update payment ke paid, lalu extend subscription store.
// Idempoten — hanya proses payment yang masih pending (webhook bisa terkirim lebih dari sekali).
export const fulfillPayment = async (invoiceId: string, paidAt: Date) =>
⋮----
// Update status payment
⋮----
// Cari expiry aktif store — extend dari sana, atau dari sekarang jika sudah expired
⋮----
// Komisi referral 50% — hanya jika store punya referrer
⋮----
export const expirePayment = async (invoiceId: string) =>
````

## File: apps/api/src/utils/jwt.ts
````typescript
import { sign, verify } from "hono/jwt";
import { config } from "../config.js";
import type { JwtClaims } from "../types/jwt.js";
⋮----
export const setClaims = async (payload: JwtClaims) =>
⋮----
export const getClaims = async (token: string) =>
````

## File: apps/web/src/components/layout/Layout.tsx
````typescript
import { Link, Outlet } from "@tanstack/react-router";
import Navbar from "../Navbar";
import { AlignJustify, BarChart2, Info } from "lucide-react";
import { useIsActivePath } from "@/hooks/useIsActivePath";
⋮----
{/* ── Desktop navbar ── */}
⋮----
{/* ── Mobile header ── */}
````

## File: apps/web/src/components/Navbar.tsx
````typescript
import { Link, useLocation, type LinkOptions } from "@tanstack/react-router";
⋮----
interface NavLinks {
  label: string;
  href: LinkOptions["to"];
}
⋮----
export default function Navbar()
⋮----
{/* <Link
          to="/"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-500"
        >
          <Upload className="w-3.5 h-3.5" />
          Mulai upload
        </Link> */}
````

## File: apps/web/src/hooks/useUpload.ts
````typescript
import { useNavigate } from "@tanstack/react-router";
import { useUploadMutation } from "@/features/klerek/hooks/useUploadPos";
⋮----
export interface RecentUpload {
  name: string;
  storeName: string;
  branchId: string;
  timestamp: string;
}
⋮----
function saveRecent(file: File, storeName: string, branchId: string)
⋮----
export function getRecentUploads(): RecentUpload[]
⋮----
export function useUpload()
⋮----
const upload = (file: File) =>
````

## File: apps/api/src/db/client.ts
````typescript
import { config } from "../config.js";
import { sql } from "drizzle-orm";
import { sendLog } from "../utils/telegram.js";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import {
  store,
  subscription,
  payment,
  storeRelations,
  subsRelations,
  paymentRelations,
  users,
  balance,
  balanceRelations,
  dailySummary,
  dailySummaryRelations,
} from "./schema.js";
⋮----
export const checkDB = async (): Promise<boolean> =>
````

## File: apps/web/src/config.ts
````typescript
interface Config {
  API_URL: string;
  ENV: "production" | "development";
  ACCESS_TOKEN_KEY: string;
  STORE_PAGE_LIMIT: number;
  GOOGLE_CLIENT_ID: string;
}
⋮----
// env kosong → Number("") = 0, jadi cek > 0 (bukan sekadar isNaN)
````

## File: apps/api/package.json
````json
{
  "name": "@apps/api",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts"
    }
  },
  "scripts": {
    "dev": "tsx ./server.ts",
    "migration:run": "drizzle-kit migrate",
    "migration:generate": "drizzle-kit generate"
  },
  "dependencies": {
    "@hono/node-server": "^2.0.1",
    "@neondatabase/serverless": "^1.0.2",
    "@types/adm-zip": "^0.5.7",
    "@types/jsonwebtoken": "9.0.10",
    "adm-zip": "^0.5.16",
    "better-sqlite3": "^12.8.0",
    "dotenv": "^17.4.0",
    "drizzle-orm": "^0.45.1",
    "hono": "^4.12.9",
    "jose": "^6.2.3",
    "pg": "^8.20.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "^20.11.17",
    "@types/pg": "^8.20.0",
    "drizzle-kit": "^0.31.10",
    "tsx": "^4.7.1",
    "typescript": "^5.8.3"
  }
}
````

## File: apps/api/src/features/auth/middleware.ts
````typescript
import { jwt } from "hono/jwt";
import { config } from "../../config.js";
import type { MiddlewareHandler } from "hono";
import { getClaims } from "../../utils/jwt.js";
import { getCookie } from "hono/cookie";
import { Exception } from "../../error.js";
import type { JwtClaims } from "../../types/jwt.js";
⋮----
export const authMiddleware: MiddlewareHandler = async (c, next) =>
⋮----
export const adminMiddleware: MiddlewareHandler = async (c, next) =>
⋮----
export const superAdminMiddleware: MiddlewareHandler = async (c, next) =>
⋮----
export const cookieMiddleware: MiddlewareHandler = async (c, next) =>
````

## File: apps/web/package.json
````json
{
  "name": "@apps/web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@apps/api": "workspace:*",
    "@radix-ui/react-slot": "^1.2.4",
    "@react-oauth/google": "^0.13.5",
    "@tanstack/react-query": "^5.104.5",
    "@tanstack/react-router": "^1.170.45",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "hono": "4.12.9",
    "lucide-react": "^1.14.0",
    "qrcode.react": "^4.2.0",
    "radix-ui": "^1.4.3",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.4",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "tailwindcss": "^4.2.4",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1"
  }
}
````

## File: apps/api/src/features/store/handler.ts
````typescript
import { Hono } from "hono";
import {
  getAllStore,
  getStoreByIDWithLatestSubs,
  getStorePublicInfo,
  addSubscriptionByBalance,
  setStoreReferrer,
  countStore,
} from "./service.js";
import { isValidStoreID } from "./helper.js";
import { Exception } from "../../error.js";
import { authMiddleware, cookieMiddleware } from "../auth/middleware.js";
import { referStoreValidator } from "./validator.js";
import type { JwtClaims } from "../../types/jwt.js";
import type { ApiResponse } from "../../types/response.js";
⋮----
// POST /store/:id/subscribe — tambah subscription via balance
// Hanya untuk toko yang refer ke akun pemanggil. Superadmin tidak dikenai debit.
````

## File: apps/api/src/features/health/handler.ts
````typescript
import { Hono } from "hono";
import { checkDB } from "../../db/client.js";
import { pingTelegram } from "../../utils/telegram.js";
import { type Config, config } from "../../config.js";
import { authMiddleware, superAdminMiddleware } from "../auth/middleware.js";
import { checkSaweria } from "../../utils/saweria.js";
import type { ApiResponse } from "../../types/response.js";
````

## File: apps/api/src/index.ts
````typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerekHandler } from "./features/clerek/handler.js";
import { storeHandler } from "./features/store/handler.js";
import { authHandler } from "./features/auth/handler.js";
import { paymentHandler } from "./features/payment/handler.js";
import { userHandler } from "./features/user/handler.js";
import { errorHandler, notFoundHandler } from "./error.js";
import { healthHandler } from "./features/health/handler.js";
import { config } from "./config.js";
⋮----
export type AppType = typeof app;
````

## File: apps/web/src/components/layout/AdminLayout.tsx
````typescript
import { getCurrentUser } from "@/lib/session";
import { Store, User, Users } from "lucide-react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
⋮----
{/* Bottom Tab Bar (Mobile) / Floating Nav (Desktop) */}
````

## File: apps/api/src/config.ts
````typescript
export interface Config {
  NODE_ENV: "production" | "development";
  DATABASE_URL: string;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  CORS_ORIGIN: string;
  SAWERIA_BASE_URL: string;
  SAWERIA_USER_ID: string;
  SAWERIA_WEBHOOK_TOKEN: string;
  COOKIE_TOKEN_KEY: string;
  ACCESS_TOKEN_KEY: string;
  GOOGLE_CLIENT_ID: string;
}
````

## File: apps/api/src/db/schema.ts
````typescript
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  integer,
  uuid,
  pgEnum,
  boolean,
  date,
  uniqueIndex,
  text,
} from "drizzle-orm/pg-core";
⋮----
// Status: pending → paid | failed | expired
⋮----
// invoiceId = donation id dari Saweria; qrString = payload QRIS mentah (di-render jadi QR di frontend)
⋮----
// Rekap harian hasil upload — satu baris per (toko, kasir, tanggal). Upload ulang = upsert.
⋮----
export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
⋮----
export type EnumRole = User["role"];
⋮----
export type Balance = InferSelectModel<typeof balance>;
export type BalanceInsert = InferInsertModel<typeof balance>;
⋮----
export type Store = InferSelectModel<typeof store>;
export type StoreInsert = InferInsertModel<typeof store>;
⋮----
export type Subscription = InferSelectModel<typeof subscription>;
export type SubscriptionInsert = InferInsertModel<typeof subscription>;
⋮----
export type Payment = InferSelectModel<typeof payment>;
export type PaymentInsert = InferInsertModel<typeof payment>;
⋮----
export type DailySummary = InferSelectModel<typeof dailySummary>;
export type DailySummaryInsert = InferInsertModel<typeof dailySummary>;
````

## File: apps/api/src/features/clerek/handler.ts
````typescript
import { Hono } from "hono";
import { initAndValidateDB, prepareDbBuffer, processDB, saveDailySummary } from "./service.js";
import { addNewStore, getStoreByIDWithLatestSubs } from "../store/service.js";
import { startTrial } from "../subscription/service.js";
import { cookieMiddleware } from "../auth/middleware.js";
import { setClaims } from "../../utils/jwt.js";
import type { JwtClaims } from "../../types/jwt.js";
import { setCookie } from "hono/cookie";
import { sendLog } from "../../utils/telegram.js";
import { config } from "../../config.js";
import type { ApiResponse } from "../../types/response.js";
import { time } from "../../constant/time.js";
⋮----
type StoreWithSubs = {
  id: string;
  name: string;
  branchId: string | null;
  createdAt: Date;
  subs: {
    id: number;
    createdAt: Date;
    storeId: string;
    expiresAt: Date;
  }[];
};
⋮----
// UPLOAD
⋮----
// CASE CLAIMS DAN KODE TOKO DI FILE BERBEDA => CEK DB!
⋮----
// just in case, by logic harusnya semua store udah punya subs (trial)
⋮----
// CASE TOKO BARU
⋮----
// SIMPAN REKAP HARIAN — best effort, jangan gagalkan upload
⋮----
// CASE DEVICE BARU
````

## File: apps/web/src/lib/authGuard.ts
````typescript
import { redirect } from "@tanstack/react-router";
import type { JwtClaims } from "@apps/api";
import { refreshAccessToken } from "@/features/auth/services/authService";
import { getClaims } from "@/lib/session";
import { config } from "@/config";
⋮----
export async function getClaimsOrRefresh(): Promise<JwtClaims | null>
⋮----
export async function requireAuthGuard()
⋮----
export async function requireSuperadminGuard()
⋮----
export async function redirectIfAuthenticatedGuard()
````

## File: apps/api/src/features/payment/handler.ts
````typescript
import { Hono } from "hono";
import { cookieMiddleware } from "../auth/middleware.js";
import { createDonation, verifyWebhookToken, type SaweriaWebhookPayload } from "../../utils/saweria.js";
import { getStorePublicInfo } from "../store/service.js";
import {
  createPendingPayment,
  getPaymentByInvoiceId,
  getPaymentsByStoreId,
  findReusablePendingPayment,
  fulfillPayment,
  expirePayment,
  isPaymentExpired,
} from "./service.js";
import { Exception } from "../../error.js";
import { sendLog } from "../../utils/telegram.js";
import { generatePaymentValidator } from "./validator.js";
import type { JwtClaims } from "../../types/jwt.js";
import type { ApiResponse } from "../../types/response.js";
import { dataPrice } from "../../constant/price.js";
⋮----
// GET /payment — daftar payment milik store yang login (belum dipakai FE)
⋮----
// POST /payment/generate — buat donasi QRIS di Saweria. Public: siapa pun boleh membayar untuk toko mana pun.
// Body: { storeId, packageIndex, email }
⋮----
// Anti-spam + UX: pakai ulang QR yang masih berlaku alih-alih buat donasi baru
⋮----
// message tampil di dashboard Saweria — dipakai untuk melacak toko & paket
⋮----
// invoiceId = donation id Saweria — dicocokkan dengan `id` di payload webhook
⋮----
// GET /payment/:invoiceId — cek status payment (dari DB; status diperbarui oleh webhook).
// Public: invoiceId adalah UUID Saweria, tidak bisa ditebak.
⋮----
// POST /payment/webhook?token=... — dipanggil Saweria setiap ada donasi masuk.
// Selalu balas 200 setelah token valid agar Saweria tidak retry untuk kasus yang memang diabaikan.
⋮----
// Donasi langsung lewat halaman Saweria (bukan dari aplikasi) — abaikan
````

## File: apps/api/src/features/store/service.ts
````typescript
import { and, count, desc, eq, exists, gt, ilike, max, not, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { store, subscription, users, balance, type StoreInsert, type User } from "../../db/schema.js";
import { Exception } from "../../error.js";
import { dataPrice } from "../subscription/data.js";
⋮----
export type StoreStatusFilter = "active" | "expired";
⋮----
interface PageQuery {
  limit: number;
  offset: number;
  search?: string;
  status?: StoreStatusFilter;
}
⋮----
interface UserQuery {
  userId?: string;
  role?: User["role"];
}
⋮----
export const countStore = async (
⋮----
// True jika di tabel subscription ada minimal satu data yang isTrial-nya true
⋮----
export const getAllStore = async (
⋮----
// user biasa hanya melihat toko referral miliknya; admin & superadmin melihat semua
⋮----
// toko aktif = punya minimal satu subscription yang belum expired
⋮----
// store.id sebagai tie-breaker agar offset stabil (tidak ada toko dobel/terlewat antar halaman)
⋮----
export const getStorePublicInfo = async (id: string): Promise<
⋮----
export const getStoreByIDWithLatestSubs = async (id: string) =>
⋮----
/** ID toko yang direferral user — dipakai untuk membatasi akses data toko. */
export const getReferredStoreIds = async (userId: string): Promise<string[]> =>
⋮----
export const setStoreReferrer = async (storeId: string, referralCode: string) =>
⋮----
export const addNewStore = async (values: StoreInsert) =>
⋮----
export const getUserBalance = async (userId: string): Promise<number> =>
⋮----
export const addSubscriptionByBalance = async (
  userId: string,
  userRole: "user" | "admin" | "superadmin",
  storeId: string,
  packageIndex: number,
) =>
````

## File: apps/api/src/features/auth/service.ts
````typescript
import { Exception } from "../../error.js";
import { db } from "../../db/client.js";
import { eq } from "drizzle-orm";
import { users, type User } from "../../db/schema.js";
import { verifyGoogleIdToken } from "../../utils/googleAuth.js";
import { setClaims, getClaims } from "../../utils/jwt.js";
import { sendLog } from "../../utils/telegram.js";
import { comparePassword, getUsernameFromEmail } from "./utils.js";
import { generateUniqueReferralCode } from "../user/service.js";
import type { GoogleAuthInput, LoginAuthInput } from "./validator.js";
⋮----
export const loginWithPassword = async (paylaod: LoginAuthInput) =>
⋮----
export const loginWithGoogle = async (payload: GoogleAuthInput) =>
⋮----
// Role bersifat DB-authoritative: user baru selalu "user", promosi ke
// admin/superadmin dilakukan lewat panel superadmin atau seed bootstrap.
⋮----
// Sinkron profil dari Google, tapi role tidak pernah ditimpa saat login.
⋮----
export const issueToken = async (claims: User) =>
⋮----
export const refreshUserToken = async (token: string) =>
````

## File: apps/api/src/features/auth/handler.ts
````typescript
import { Hono } from "hono";
import { loginWithGoogle, refreshUserToken, issueToken, loginWithPassword } from "./service.js";
import { authMiddleware } from "./middleware.js";
import type { JwtClaims } from "../../types/jwt.js";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import { config } from "../../config.js";
import type { Balance } from "../../db/schema.js";
import { googleLoginValidator, loginValidator } from "./validator.js";
import { getBalanceHistory, getProfile } from "../user/service.js";
import type { ApiResponse } from "../../types/response.js";
⋮----
// atribut harus sama persis saat set & delete, kalau tidak browser tidak menghapus cookie
const refreshCookieOptions = (): CookieOptions =>
⋮----
// refresh token stateless (tidak disimpan di DB), jadi logout = hapus cookie-nya
⋮----
// todo : gabungkan dengan endpoint di atas
````
